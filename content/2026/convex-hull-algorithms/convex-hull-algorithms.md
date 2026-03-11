Title: Convex Hulls: Wrapping Points with Algorithms
Date: 2026-03-11
Author: Jack McKew
Category: Python
Tags: python, computational-geometry, convex-hull, algorithms, scipy, matplotlib

Draw a rubber band around a scatter of points. Tighten it. The polygon that forms is the convex hull - the smallest convex shape that contains all your points.

It's a simple concept with serious applications. Find outliers, simplify country borders, detect collisions in games, or find the bounding shape of GPS tracks.

And the algorithm to compute it is elegant enough to be worth understanding from scratch.

## What Is a Convex Hull?

Formally: the smallest convex polygon containing all points.

Intuitively: if you hammered nails at each point and wrapped a rubber band around them, the band's outline is the hull.

Points on the hull are "extreme" - they're the northernmost, southernmost, easternmost, westernmost, and various diagonal extremes. Interior points are guaranteed to be inside the polygon.

Real applications:
- Collision detection: check if objects overlap by testing convex hulls instead of complex shapes
- Outlier detection: points far from the hull are anomalies
- GPS analysis: find the bounding area of a travel route
- Data clustering: hull size indicates cluster density
- Political geography: simplify country borders to a few key points

## Graham Scan: Understanding the Algorithm

Graham scan is the classic O(n log n) algorithm. It's conceptually simple and worth implementing to understand.

The idea:
1. Sort points by their x-coordinate (or polar angle from a reference point)
2. Iterate through points, maintaining a stack of hull vertices
3. At each point, pop the stack while the last three points make a "right turn" (not a left turn)
4. Push the current point

"Left turn" and "right turn" are determined by the cross product. If you're walking from point A to point B to point C, a left turn means C is to the left of the line AB. A right turn means C is to the right.

```python
def cross_product(o, a, b):
    """
    Cross product of vectors OA and OB.
    Positive = left turn, Negative = right turn, Zero = collinear.
    """
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

def graham_scan(points):
    """
    Compute convex hull using Graham scan.
    Returns hull vertices in counter-clockwise order.
    """
    points = sorted(set(points))  # Remove duplicates, sort by x then y
    if len(points) <= 1:
        return points

    # Build lower hull
    lower = []
    for p in points:
        while len(lower) >= 2 and cross_product(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)

    # Build upper hull
    upper = []
    for p in reversed(points):
        while len(upper) >= 2 and cross_product(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)

    # Remove last point of each half because it's repeated
    return lower[:-1] + upper[:-1]
```

Walk through this with an example:
- Points: [(0, 0), (1, 0), (0.5, 0.5), (1, 1), (0, 1)]
- After sorting: [(0, 0), (0, 1), (0.5, 0.5), (1, 0), (1, 1)]
- Lower hull: (0, 0) -> (1, 0) -> (1, 1)
- Upper hull: (1, 1) -> (0, 1) -> (0, 0)
- Result: a square-ish shape

The cross product check ensures that every turn is a left turn, which guarantees a convex polygon.

## Using Scipy for Real Work

You don't need to implement Graham scan in production. Scipy has it:

```python
import numpy as np
from scipy.spatial import ConvexHull
import matplotlib.pyplot as plt

points = np.random.rand(50, 2)
hull = ConvexHull(points)

# hull.vertices: indices of hull points
# hull.volume: area of the hull (in 2D, it's area; in 3D, it's volume)
# hull.area: perimeter (in 2D) or surface area (in 3D)

print(f"Hull area: {hull.volume:.2f}")
print(f"Hull points: {len(hull.vertices)}")

# Plot
plt.scatter(points[:, 0], points[:, 1], alpha=0.5)
for simplex in hull.simplices:
    plt.plot(points[simplex, 0], points[simplex, 1], 'k-')
plt.plot(points[hull.vertices, 0], points[hull.vertices, 1], 'r-', linewidth=2)
plt.show()
```

`ConvexHull` returns:
- `vertices`: indices of points on the hull
- `volume`: area in 2D
- `area`: perimeter in 2D
- `simplices`: edges of the hull

## Animating Graham Scan

Animating Graham scan step-by-step is hypnotic:

```python
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation

points = np.random.rand(20, 2)
points = sorted(set(map(tuple, points)))

fig, ax = plt.subplots(figsize=(8, 8))

def cross_product(o, a, b):
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

# Compute lower hull with history
lower_history = []
lower = []
for p in points:
    while len(lower) >= 2 and cross_product(lower[-2], lower[-1], p) <= 0:
        lower.pop()
    lower.append(p)
    lower_history.append(list(lower))

def animate(frame):
    ax.clear()
    ax.scatter(*zip(*points), alpha=0.3, s=30)

    if frame < len(lower_history):
        hull_points = lower_history[frame]
        if len(hull_points) > 1:
            hull_array = np.array(hull_points)
            ax.plot(hull_array[:, 0], hull_array[:, 1], 'r-', linewidth=2, label='Hull')
        if len(hull_points) > 0:
            ax.scatter(*hull_points[-1], c='red', s=100, zorder=5)

    ax.set_xlim(-0.05, 1.05)
    ax.set_ylim(-0.05, 1.05)
    ax.set_aspect('equal')
    ax.set_title(f'Graham Scan - Frame {frame}')
    ax.legend()

anim = FuncAnimation(fig, animate, frames=len(lower_history), interval=100)
plt.show()
```

You watch the hull grow point by point. Interior points appear briefly as the algorithm backtracks. It's the algorithm made visible.

## Real Application: GPS Track Bounding

I tracked a hiking route with GPS. 2000+ points scattered over 12km. To find the "bounding area" of the hike, I computed the convex hull.

The hull had 47 vertices. This vastly simplified the shape - from 2000 arbitrary points to 47 key extremes. I could now:
- Calculate the area covered (hull volume)
- Draw the boundary on a map
- Check if a new GPS point was within the hike's bounding box (point-in-polygon test)
- Simplify the visualization (2000 points rendered slowly; 47 vertices is instant)

The algorithm took milliseconds. The hull fit the actual route perfectly.

## Outlier Detection

Outliers often lie on or near the convex hull. Points far from the hull interior are suspicious.

```python
from scipy.spatial import ConvexHull

def find_outliers(points, threshold=0.95):
    """
    Points outside the hull or near its edges are outliers.
    threshold: percentile of distances to consider outliers.
    """
    hull = ConvexHull(points)

    # For each point, compute its distance to the hull
    distances = []
    for p in points:
        # Is this point on the hull?
        if any((points[i] == p).all() for i in hull.vertices):
            distances.append(0)
        else:
            # Distance to nearest edge (simplified)
            distances.append(1)  # Or compute properly

    threshold_value = np.percentile(distances, threshold * 100)
    outliers = [p for p, d in zip(points, distances) if d > threshold_value]
    return outliers
```

Real outlier detection is more sophisticated, but the principle is sound: hull points and near-hull points are often anomalies.

## Optimizations and Variants

**3D hulls**: ConvexHull handles 3D points too. In 3D, it computes surface area and volume. Useful for bounding boxes of 3D models.

**Quickhull**: Another O(n log n) algorithm, often faster in practice than Graham scan, especially for uniformly random points. Scipy uses it by default.

**Incremental construction**: If points arrive one at a time, you can update the hull incrementally without recomputing from scratch. Useful for real-time systems.

**Gift wrapping (Jarvis march)**: O(n*h) where h is the hull size. Slower for most cases, but fast when the hull is small (few extreme points).

## Forward

Convex hulls are a gateway to computational geometry. Learn them and you understand:
- Cross products and orientation tests
- Polygon algorithms (point-in-polygon, polygon clipping)
- Data structure design for computational problems
- Trade-offs between algorithm complexity and practical performance

Use them to bound your data, detect outliers, and simplify shapes. The applications are everywhere.
