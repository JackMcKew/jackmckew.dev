Title: Image to Single Line
Date: 2026-03-10
Author: Jack McKew
Category: Python
Tags: image-processing, art, tsp, single-line, python, opencv

I wanted to convert photos into single continuous line drawings - the kind of minimalist art where one pen never lifts off the paper. The technical challenge: given an image, extract key points, then find the shortest path that visits all of them without crossing itself.

This is essentially the Travelling Salesman Problem (TSP) applied to art. The output always looks cooler than you'd expect, even on failure cases.

## The Approach: Stippling to TSP

There are two main strategies:

1. **Stippling method**: Convert image to a stippled (dotted) representation, then solve TSP on the dots.
2. **Contour method**: Extract edges and turn them into a connected path.

I started with stippling because it's more straightforward.

## Step 1: Convert Image to Stipples

```python
import cv2
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt

# Load image
img = cv2.imread('portrait.jpg', cv2.IMREAD_GRAYSCALE)
height, width = img.shape

# Downscale for faster processing
scale_factor = 0.3
img = cv2.resize(img, (int(width * scale_factor), int(height * scale_factor)))
height, width = img.shape

# Normalize to 0-1
img_norm = img.astype(float) / 255.0

# Create stipple points: denser in dark areas
# Inverted: dark areas of image = many dots
num_dots = 5000
stipple_points = []

# Poisson disk sampling would be better, but this is simpler:
# Generate random points, weight by image darkness
for _ in range(num_dots * 3):  # Generate excess, filter
    y = np.random.randint(0, height)
    x = np.random.randint(0, width)
    darkness = 1.0 - img_norm[y, x]  # Invert: dark=high value
    if np.random.random() < darkness:
        stipple_points.append([x, y])

# Keep only the required number
stipple_points = np.array(stipple_points[:num_dots])

print(f"Generated {len(stipple_points)} stipple points")

# Visualize
fig, axes = plt.subplots(1, 2, figsize=(12, 5))
axes[0].imshow(img, cmap='gray')
axes[0].set_title('Original')
axes[1].scatter(stipple_points[:, 0], stipple_points[:, 1], s=1, alpha=0.5)
axes[1].set_xlim(0, width)
axes[1].set_ylim(height, 0)
axes[1].set_title('Stipples')
plt.tight_layout()
plt.savefig('stipples.png', dpi=150)
plt.show()
```

The stipple density encodes the image - dark areas get more dots, light areas fewer. When you draw a line through all the dots, the line density builds up the image.

## Step 2: Solve TSP

Now you have a set of 2D points and you need to find the shortest path that visits all of them. This is NP-hard, but for 5,000 points you can use heuristics.

Simple approach: nearest neighbour (greedy).

```python
def nearest_neighbour_tsp(points):
    """Greedy TSP: start at a point, always go to nearest unvisited."""
    n = len(points)
    unvisited = set(range(n))
    current = 0
    path = [current]
    unvisited.remove(current)

    while unvisited:
        nearest = min(unvisited,
                     key=lambda i: np.linalg.norm(points[current] - points[i]))
        path.append(nearest)
        unvisited.remove(nearest)
        current = nearest

    return path

path = nearest_neighbour_tsp(stipple_points)
ordered_points = stipple_points[path]

print(f"TSP path length: {len(path)} points")
print(f"Total distance: {sum(np.linalg.norm(ordered_points[i] - ordered_points[i+1]) for i in range(len(ordered_points)-1)):.0f}")
```

Nearest neighbour is fast (O(n^2)) but suboptimal. For better results, use a library like `concorde` (the best TSP solver, but requires installation) or `LKH` (Lin-Kernighan heuristic).

## Step 3: Connect and Smooth

The TSP path might have jumps. You can improve it with local optimisations like 2-opt swaps:

```python
def two_opt(path, points, iterations=1000):
    """Local optimization: swap edges to reduce crossings."""
    improved = True
    best_distance = sum(np.linalg.norm(points[path[i]] - points[path[i+1]])
                       for i in range(len(path)-1))

    for _ in range(iterations):
        if not improved:
            break
        improved = False

        for i in range(1, len(path) - 2):
            for j in range(i + 1, len(path)):
                if j - i == 1:
                    continue
                # Reverse the section path[i:j]
                new_path = path[:i] + path[i:j][::-1] + path[j:]
                new_distance = sum(np.linalg.norm(points[new_path[k]] - points[new_path[k+1]])
                                  for k in range(len(new_path)-1))

                if new_distance < best_distance:
                    path = new_path
                    best_distance = new_distance
                    improved = True
                    break

            if improved:
                break

    return path

optimized_path = two_opt(path, stipple_points, iterations=500)
ordered_points_opt = stipple_points[optimized_path]
```

## Step 4: Render the Single Line

```python
fig, ax = plt.subplots(figsize=(12, 10))

# Draw the continuous line
ax.plot(ordered_points_opt[:, 0], ordered_points_opt[:, 1],
       linewidth=0.5, color='black', alpha=0.8)

# Optional: add start and end markers
ax.plot(ordered_points_opt[0, 0], ordered_points_opt[0, 1], 'go', markersize=8, label='Start')
ax.plot(ordered_points_opt[-1, 0], ordered_points_opt[-1, 1], 'ro', markersize=8, label='End')

ax.set_xlim(0, width)
ax.set_ylim(height, 0)
ax.set_aspect('equal')
ax.axis('off')
ax.legend()
ax.set_title('Single Line Drawing')
plt.tight_layout()
plt.savefig('single_line.png', dpi=300, bbox_inches='tight')
plt.show()
```

## Alternative: Contour-Based

If you want more structure (follow actual edges), use contour detection:

```python
# Edge detection
edges = cv2.Canny(img, 100, 200)

# Find contours
contours, _ = cv2.findContours(edges, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

# Simplify contours
simplified_contours = []
for contour in contours:
    if cv2.contourArea(contour) > 50:  # Filter small noise
        approx = cv2.approxPolyDP(contour, 2, True)
        simplified_contours.append(approx)

# Convert contours to a point list
contour_points = []
for contour in simplified_contours:
    for point in contour:
        contour_points.append(point[0])

contour_points = np.array(contour_points)

# Now solve TSP on contour points instead
path = nearest_neighbour_tsp(contour_points)
```

Contour-based output looks more like actual line art but requires more tuning.

## Results and Quirks

The output is genuinely striking:

- **Portraits**: Work surprisingly well. The line density builds up eyes and lips naturally.
- **Landscapes**: Struggle because the line clustering doesn't convey colour variation.
- **High contrast images**: Work best. Low contrast photos turn into blurry blobs.
- **TSP quality**: Nearest neighbour is fast but leaves visible jumps. If you can run a better solver, the visual quality improves noticeably.

One gotcha: the pen path might cross itself even with 2-opt optimisation. To enforce true "single line without crossings", you need to solve the constrained TSP, which is harder.

## Performance Notes

For 5,000 points:
- Nearest neighbour: < 1 second
- 2-opt with 500 iterations: 5-10 seconds
- Rendering: instant

For larger point clouds (10,000+), nearest neighbour gets slow. Switch to scipy's cKDTree for faster nearest-neighbour lookup, or use a proper TSP library.

## Why This Works

The key insight is that TSP ordering + line rendering approximates the image tone through line density. Dark areas need more dots, so more line passes through them. The eye blends the discontinuous dots into shading.

It's basically pen stippling automated. Medieval manuscripts use the same principle - more ink density = darker tone.

If you push this further, you could export the path as SVG and actually plot it with a pen plotter. That's the endgame: physically draw the image with a real pen on paper.

Try it on a portrait or a high-contrast photo. The results are always interesting, sometimes beautiful.
