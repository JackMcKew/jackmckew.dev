Title: Generating Terrain with Fractals
Date: 2026-03-11
Author: Jack McKew
Category: Python
Tags: python, fractals, terrain-generation, noise, matplotlib, 3d

Procedural terrain is magic. You start with random values, apply some fractal logic, and out comes mountains, valleys, and coastlines. No artist required.

The algorithm is simple enough to understand in 30 minutes. The results look like you spent weeks hand-sculpting.

## The 1D Version: Midpoint Displacement

Start with two points at elevation 0. Find the midpoint. Raise or lower it randomly.

Now you have 4 segments. For each segment, find its midpoint and perturb it - but with less randomness than before.

Repeat. Each iteration doubles the number of points and halves the random variation. The result is a jagged 1D line that looks like a cross-section of terrain.

```python
import numpy as np
import matplotlib.pyplot as plt

def midpoint_displacement(iterations=7):
    # Start: 2 points at 0
    points = [0, 0]
    max_displacement = 1.0

    for i in range(iterations):
        new_points = []
        for j in range(len(points) - 1):
            new_points.append(points[j])
            # Midpoint
            midpoint = (points[j] + points[j + 1]) / 2
            # Perturb it
            midpoint += np.random.uniform(-max_displacement, max_displacement)
            new_points.append(midpoint)
        new_points.append(points[-1])
        points = new_points
        max_displacement *= 0.5  # Reduce randomness

    return points

terrain_1d = midpoint_displacement(iterations=8)
plt.plot(terrain_1d)
plt.ylabel('Elevation')
plt.show()
```

Run this. You get a convincing mountain profile - high peaks, gentle slopes, valleys. It doesn't look random. It looks natural.

The reason: you're controlling the scale of variation. Large features (mountains) come first. Small features (foothills, rocks) come later. Human brains recognize this as natural terrain.

## The 2D Version: Diamond-Square Algorithm

Apply midpoint displacement in 2D. You get the diamond-square (or midpoint subdivision) algorithm.

Start with a grid of 2x2 points. For each iteration:
1. **Diamond step**: find the center of each 2x2 square, set it to the average of the four corners plus random noise
2. **Square step**: for each of the new diamond centers, find the four adjacent diamonds and set them to the average of the four corners plus noise

Repeat until your grid is as fine as you want.

```python
import numpy as np
from mpl_toolkits.mplot3d import Axes3D
import matplotlib.pyplot as plt

def diamond_square(size=65, roughness=0.5):
    """
    size: grid size (must be 2^n + 1, e.g., 65, 129, 257)
    roughness: how jagged (0-1, higher = rougher)
    """
    grid = np.zeros((size, size))

    # Initialize corners with small values
    grid[0, 0] = np.random.rand()
    grid[0, -1] = np.random.rand()
    grid[-1, 0] = np.random.rand()
    grid[-1, -1] = np.random.rand()

    step_size = size - 1
    scale = 1.0

    while step_size > 1:
        half_step = step_size // 2

        # Diamond step
        for y in range(0, size - 1, step_size):
            for x in range(0, size - 1, step_size):
                avg = (grid[y, x] + grid[y, x + step_size] +
                       grid[y + step_size, x] + grid[y + step_size, x + step_size]) / 4
                grid[y + half_step, x + half_step] = avg + np.random.uniform(-1, 1) * scale

        # Square step
        for y in range(0, size, half_step):
            for x in range((y + half_step) % step_size, size, step_size):
                avg_count = 0
                avg_val = 0

                # Average neighbors (wrap edges)
                for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                    ny, nx = y + dy * half_step, x + dx * half_step
                    if 0 <= ny < size and 0 <= nx < size:
                        avg_val += grid[ny, nx]
                        avg_count += 1

                if avg_count > 0:
                    grid[y, x] = avg_val / avg_count + np.random.uniform(-1, 1) * scale

        step_size = half_step
        scale *= roughness

    return grid

# Generate terrain
terrain = diamond_square(size=129, roughness=0.6)

# 3D surface plot
fig = plt.figure(figsize=(12, 9))
ax = fig.add_subplot(111, projection='3d')

x = np.arange(terrain.shape[0])
y = np.arange(terrain.shape[1])
X, Y = np.meshgrid(x, y)

# Colour by elevation: brown (low) to white (high)
ax.plot_surface(X, Y, terrain, cmap='terrain', linewidth=0)
ax.set_xlabel('X')
ax.set_ylabel('Y')
ax.set_zlabel('Elevation')
plt.show()
```

This generates a full 2D terrain map. Adjust `roughness` to change how fractal it is:
- 0.3-0.4: smooth rolling hills
- 0.5-0.6: realistic mountains with sharp peaks
- 0.7+: jagged alien landscape

The algorithm is O(n^2 log n) because you iterate O(log n) times and each iteration touches O(n^2) cells.

## The Fractal Dimension Insight

The roughness parameter controls something called the fractal dimension. Lower values create smoother terrain (dimension closer to 2, a flat plane). Higher values create rougher terrain (dimension closer to 3, more "jumbled").

Real terrain has a fractal dimension around 2.2-2.4 - rougher than a smooth surface, but with structure and pattern.

This same insight applies to coastlines, mountains, and clouds. They're all fractals. Change the parameters and the same algorithm generates any of them.

## Perlin Noise Alternative

Perlin noise is smoother than diamond-square and often used for game terrain. The algorithm is more complex, but the idea is the same: multiple layers of noise at different scales.

scipy's `scipy.ndimage` and libraries like `opensimplex` provide Perlin-like noise:

```python
from opensimplex import OpenSimplex

noise = OpenSimplex()
terrain = np.zeros((128, 128))

for y in range(128):
    for x in range(128):
        terrain[y, x] = noise.noise2(x / 32, y / 32) * 0.5
        terrain[y, x] += noise.noise2(x / 64, y / 64) * 0.25
        terrain[y, x] += noise.noise2(x / 128, y / 128) * 0.125

# Normalize to 0-1
terrain = (terrain - terrain.min()) / (terrain.max() - terrain.min())
```

Perlin is smoother and often better for game maps. Diamond-square is more obviously fractal.

## Real Application: Game Map Generation

I used diamond-square to generate player maps for a strategy game. Each map is 512x512 cells. I generated the height, then applied a sea level threshold:
- Below 0.3: ocean
- 0.3-0.5: beach
- 0.5-0.8: grass
- 0.8+: mountains

Dropped some random trees and placed towns at local maxima. Map looked handmade and each playthrough was different.

The algorithm ran in ~50ms on a laptop. For a game that needs dynamic level generation, that's fast enough.

## Tweaking for Visual Quality

To make terrain look better:
- Clamp negative values to 0 (no underground)
- Apply a power curve to the heights (emphasize middle elevations)
- Smooth the grid after generation (simple average filter)
- Add water erosion simulation (for realism, but expensive)

```python
# Clamp and power-curve
terrain = np.maximum(terrain, 0)
terrain = terrain ** 1.2  # Emphasize mid-range

# Optional: smooth with a 3x3 blur
from scipy.ndimage import uniform_filter
terrain = uniform_filter(terrain, size=3)
```

## Forward

You can layer diamond-square with other techniques. Mix in ridges, valleys, and plateaus by modifying the algorithm. Use the terrain height as a seed for vegetation maps, temperature maps, or rainfall patterns.

The same fractal principle applies to texture generation, cloud rendering, and procedural art. Learn diamond-square and you've learned a fundamental tool for generating infinite natural-looking worlds.
