Title: Voronoi Diagrams: Partitioning Space by Nearest Neighbour
Date: 2026-03-11
Author: Jack McKew
Category: Python
Tags: python, voronoi, computational-geometry, scipy, matplotlib, generative-art

Imagine you scatter points across a map. Every location on that map belongs to the nearest point. Colour each region by which point owns it. That's a Voronoi diagram.

It's surprisingly useful. And the math is elegant.

## What Is a Voronoi Diagram?

Formally: partition the plane so that each region contains all points closer to one seed point than to any other.

Visually: it looks like cells. Each cell is a region. The boundaries are the perpendicular bisectors between adjacent seed points.

If you've ever played a city builder game and seen territory maps showing "which city controls which land", that's a Voronoi diagram. Every tile belongs to the nearest city.

Real applications are everywhere:
- Biology: how cells divide resources (nutrient absorption)
- Geography: delivery zone optimization (which warehouse serves which suburbs)
- Procedural generation: natural-looking territorial divisions for game maps
- Network design: optimal placement of cell towers

## Computing It With Scipy

```python
import numpy as np
from scipy.spatial import Voronoi, voronoi_plot_2d
import matplotlib.pyplot as plt

# Random points
points = np.random.rand(15, 2) * 100
vor = Voronoi(points)

fig, ax = plt.subplots(figsize=(10, 10))
voronoi_plot_2d(vor, ax=ax)
plt.show()
```

That's it. `scipy.spatial.Voronoi` computes the diagram. `voronoi_plot_2d` draws it.

The `vor` object contains:
- `points`: your input seed points
- `regions`: the vertex indices for each region
- `vertices`: the actual corner coordinates of cells
- `ridge_points`: which pairs of points have adjacent cells
- `ridge_vertices`: the vertices on each cell boundary

## Fortune's Algorithm (The Magic Behind It)

Scipy uses Fortune's algorithm internally. It's clever.

Imagine a vertical line sweeping left to right across your points. As it moves, you track:
1. Points left of the line (finished)
2. Points on the line (being processed)
3. Points right of the line (not yet seen)

The boundary between "closest to points I've seen" and "closest to points I haven't seen" forms a parabola. As the sweep moves, parabolas change, and where they meet, Voronoi vertices form.

It's O(n log n), which is optimal. A naive approach checking every point against every location is O(n^2).

You don't need to implement it - scipy does it for you. But understanding it explains why the diagram emerges so cleanly.

## Animating the Motion

Here's where it gets interesting. Move the seed points and recompute. Watch the cells reshape in real time.

```python
import numpy as np
from scipy.spatial import Voronoi, voronoi_plot_2d
import matplotlib.pyplot as plt
import matplotlib.animation as animation

# Initial random points
points = np.random.rand(8, 2) * 100
velocities = (np.random.rand(8, 2) - 0.5) * 5

fig, ax = plt.subplots(figsize=(10, 10))

def update(frame):
    global points, velocities

    # Move points (bounce off edges)
    points += velocities
    points = np.where(points < 0, -points, points)
    points = np.where(points > 100, 200 - points, points)

    ax.clear()
    vor = Voronoi(points)
    voronoi_plot_2d(vor, ax=ax)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.set_title(f'Frame {frame}')

anim = animation.FuncAnimation(fig, update, frames=200, interval=50)
plt.show()
```

Run this and you see cells flowing like liquid. Points near each other get squeezed. Points far apart get more territory. It's hypnotic.

## A Real Use Case: Suburb Service Analysis

I needed to find which suburbs in Melbourne were worst-served by a particular service provider. They had 12 distribution hubs scattered across the region.

I computed the Voronoi diagram with hubs as seed points. Every suburb centroid fell into a cell. Suburbs with long distances to their hub's core were flagged as underserved.

The diagram showed visually which parts of the city had poor coverage. You could see clusters - some suburbs were in oddly shaped cells far from the hub. Those were the ones to expand first.

Without Voronoi, I'd be doing nearest-neighbour searches in a loop. With it, one computation answered the question.

## Coloring and Visualization

The default `voronoi_plot_2d` shows edges. You can colour by region:

```python
import numpy as np
from scipy.spatial import Voronoi
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon
from matplotlib.collections import PatchCollection

points = np.random.rand(20, 2)
vor = Voronoi(points)

fig, ax = plt.subplots(figsize=(10, 10))

# Colour each region
for point_index, region in enumerate(vor.regions):
    if len(region) == 0 or -1 in region:
        continue
    polygon = [vor.vertices[i] for i in region]
    patch = Polygon(polygon, alpha=0.3)
    ax.add_patch(patch)

ax.plot(points[:, 0], points[:, 1], 'ko', markersize=8)
ax.set_xlim(-0.5, 1.5)
ax.set_ylim(-0.5, 1.5)
plt.show()
```

Infinite regions (cells that extend to infinity) get dropped because `-1` appears in the region index. Real diagrams handle this by clipping to a bounding box.

For procedural generation, you'd colour by seed point ID, or by the distance from the seed (closer = lighter). The effect is organic-looking territories.

## Forward

Voronoi diagrams solve a specific problem - partitioning space by nearest neighbour. But they're a gateway to computational geometry. Learn them, and Delaunay triangulation (the dual of Voronoi), pathfinding on tessellated maps, and collision detection all become obvious extensions.

Use scipy. Build something visual. Watch it move. You'll see why these diagrams show up in so many systems.
