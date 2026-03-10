Title: Blender and Python
Date: 2026-03-10
Author: Jack McKew
Category: Python
Tags: blender, python, 3d, bpy, scripting, generative

Blender is a 3D modelling powerhouse, and it has a Python API (bpy). I spent a week learning it, and it's equal parts brilliant and frustrating. You can script almost everything - but the API feels designed by people who've never heard of consistency.

## What bpy actually is

Blender's Python API gives you access to the scene, objects, materials, physics, rendering. You can:
- Create/modify 3D geometry
- Apply materials and textures
- Set up lighting and cameras
- Run simulations (particles, fluids, smoke)
- Render and output images/video
- Batch process files

It's powerful. It's also finicky.

## Starting point: Hello, cube

```python
import bpy

# Clear existing mesh objects
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Create a cube
bpy.ops.mesh.primitive_cube_add(size=2, location=(0, 0, 0))
cube = bpy.context.active_object
cube.name = "HelloCube"

# Access the data
mesh = cube.data
print(f"Vertices: {len(mesh.vertices)}")
print(f"Edges: {len(mesh.edges)}")
print(f"Faces: {len(mesh.faces)}")

# Modify it
cube.scale = (1, 2, 0.5)
cube.location = (0, 0, 1)
cube.rotation_euler = (0.2, 0.3, 0.5)
```

That works. Cube appears in the viewport.

Now, the frustration starts.

## Context vs. data: the first gotcha

Blender has two ways to access things:

1. **Context**: `bpy.context.scene`, `bpy.context.active_object` - the current selection/viewport state
2. **Data**: `bpy.data.objects["CubeName"]` - the actual scene data

They overlap, and it's confusing. Some operations only work on context (the UI state), others only on data.

```python
# This works
cube = bpy.data.objects['HelloCube']
cube.location = (1, 0, 0)

# This also works, differently
bpy.context.active_object.location = (1, 0, 0)

# But if no object is selected, the second fails
# So always use bpy.data when possible
```

**Rule**: Use `bpy.data` when accessing specific objects. Use `bpy.context` only for operations that explicitly need viewport state.

## Generating geometry: procedural mesh

Let's build a torus (donut) from scratch:

```python
import bpy
import math

def create_torus(major_radius=1, minor_radius=0.3, major_segments=32, minor_segments=16):
    """Generate a torus mesh."""
    verts = []
    faces = []

    # Generate vertices
    for i in range(major_segments):
        theta = 2 * math.pi * i / major_segments

        for j in range(minor_segments):
            phi = 2 * math.pi * j / minor_segments

            # Torus parametric equation
            x = (major_radius + minor_radius * math.cos(phi)) * math.cos(theta)
            y = (major_radius + minor_radius * math.cos(phi)) * math.sin(theta)
            z = minor_radius * math.sin(phi)

            verts.append((x, y, z))

    # Generate faces (quads)
    for i in range(major_segments):
        for j in range(minor_segments):
            # Four corners of this quad
            a = (i * minor_segments + j) % len(verts)
            b = (i * minor_segments + (j + 1) % minor_segments) % len(verts)
            c = (((i + 1) % major_segments) * minor_segments + (j + 1) % minor_segments) % len(verts)
            d = (((i + 1) % major_segments) * minor_segments + j) % len(verts)

            faces.append((a, b, c, d))

    # Create Blender mesh
    mesh = bpy.data.meshes.new("TorusMesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()

    # Create object
    obj = bpy.data.objects.new("Torus", mesh)
    bpy.context.collection.objects.link(obj)

    return obj

torus = create_torus()
bpy.context.view_layer.objects.active = torus
torus.select_set(True)
```

This generates a torus from parametric equations. You build vertex and face lists, call `from_pydata()`, and Blender creates the mesh.

The parametric approach is elegant but limited. For complex geometry (fractals, tessellations), you'd loop-generate and track indices carefully. One indexing mistake and you get weird faces or topology errors.

## Materials and shading: where it gets weird

Blender 4.x uses Shader nodes for materials. You can set them via the Python API, but the workflow is clunky:

```python
# Create material
mat = bpy.data.materials.new(name="GoldenMaterial")
mat.use_nodes = True

# Access node tree
nodes = mat.node_tree.nodes
nodes.clear()  # Remove default nodes

# Add shader nodes
bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
output = nodes.new(type='ShaderNodeOutputMaterial')

# Configure
bsdf.inputs['Base Color'].default_value = (0.8, 0.7, 0.2, 1.0)  # RGB + Alpha
bsdf.inputs['Metallic'].default_value = 0.8
bsdf.inputs['Roughness'].default_value = 0.2

# Connect nodes
mat.node_tree.links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])

# Apply to object
obj.data.materials.append(mat)
```

This works, but: you're building a node graph in code. It's verbose and easy to get wrong. If you want complex materials (layered, with textures), you're better off building them in the UI and saving the .blend file.

One gotcha: **depsgraph**. After modifying materials, you sometimes need to update the dependency graph:

```python
bpy.context.view_layer.update()  # Force redraw
```

If things aren't rendering right, this is often the culprit.

## Rendering: the part that actually works

Rendering is straightforward:

```python
# Set render engine
bpy.context.scene.render.engine = 'CYCLES'

# Configure output
bpy.context.scene.render.filepath = '/tmp/render.png'
bpy.context.scene.render.image_settings.file_format = 'PNG'
bpy.context.scene.render.resolution_x = 1920
bpy.context.scene.render.resolution_y = 1080

# Render
bpy.ops.render.render(write_still=True)
```

Blender renders to the specified path. Simple and reliable.

For batch rendering (multiple frames or multiple files), you can loop:

```python
for frame in range(1, 101):
    bpy.context.scene.frame_set(frame)
    bpy.context.scene.render.filepath = f'/tmp/frame_{frame:04d}.png'
    bpy.ops.render.render(write_still=True)
```

This renders 100 frames. You can then encode to video with ffmpeg.

## Headless rendering

Running Blender without the UI is faster:

```bash
blender --background scene.blend --python render_script.py
```

Blender loads the file and runs your script in headless mode. No viewport overhead.

```python
# In render_script.py
import bpy

# Access the scene
scene = bpy.context.scene
scene.render.filepath = '/tmp/output.png'

# Render
bpy.ops.render.render(write_still=True)
```

This renders in ~5-10 seconds for a 1920x1080 image (depending on complexity and samples).

## What's genuinely frustrating

1. **Context changes silently**: Operations succeed without an obvious object selected, then later fail. The API doesn't raise exceptions for "no active object" consistently.

2. **Depsgraph issues**: After modifying geometry or materials, sometimes the viewport doesn't update. You need to call `bpy.context.view_layer.update()`, but figuring out *when* is trial-and-error.

3. **Collections and linking**: Objects need to be linked to collections, which are linked to scenes. If you forget a step, the object exists but doesn't render.

4. **Version changes**: Blender 4.x changed how modifiers work compared to 3.x. Code that works in one version breaks in the next.

5. **Documentation**: The official bpy docs are sparse. You learn by reading source code or Googling forum posts.

## What actually works well

- **Geometry generation**: Procedural mesh creation is solid once you grasp the vertex/face data structure
- **Scripting modifiers**: Geometry nodes are incredible for parametric design
- **Automation**: Batch processing, rendering hundreds of variations, exporting
- **Scene setup**: Cameras, lights, animation keyframes - all scriptable
- **Physics**: Simulations (particles, fluids) can be configured and baked via Python

## A practical example: procedural city

```python
import bpy
import random

def create_building(x, y, width, depth, height):
    """Create a simple building block."""
    bpy.ops.mesh.primitive_cube_add(
        size=1, location=(x, y, height/2)
    )
    building = bpy.context.active_object
    building.scale = (width/2, depth/2, height/2)
    return building

def create_city(grid_size=10, num_buildings=50):
    """Generate a random city."""
    buildings = []

    for _ in range(num_buildings):
        x = random.randint(0, grid_size) - grid_size/2
        y = random.randint(0, grid_size) - grid_size/2
        width = random.choice([2, 3, 4])
        depth = random.choice([2, 3, 4])
        height = random.choice([5, 8, 12, 15])

        building = create_building(x, y, width, depth, height)
        buildings.append(building)

    return buildings

# Clear scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Generate city
create_city()

# Render
bpy.context.scene.render.filepath = '/tmp/city.png'
bpy.ops.render.render(write_still=True)
```

Run this, and you've got a random city. Each building is a scaled cube, but with a camera, lighting, and materials, it looks decent.

## Verdict

bpy is powerful and frustrating in equal measure. You can do incredible things - procedural geometry, automated renders, complex simulations. But the API feels like it grew organically without central planning. Consistency is lacking.

If you're doing one-off renders or simple scripting, bpy is fine. If you're building a serious procedural pipeline, you'll spend time wrestling with context, depsgraph updates, and undocumented gotchas.

That said, there's nothing else like it. Blender is free, open-source, and the Python API is genuinely capable. The frustrations are worth it if you're willing to learn the quirks.
