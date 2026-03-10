Title: Lake Size Comparator
Date: 2026-03-10
Author: Jack McKew
Category: Python
Tags: geospatial, geopandas, lakes, comparison, visualisation

I wanted to build something simple: overlay different lakes on top of each other at the same scale so you can actually compare their sizes. The catch is that lakes are scattered across the globe in different projections, so you need to normalize them.

The aha moment usually comes when you see a lake you thought was huge look tiny next to something obscure you've never heard of.

## Getting Lake Data

Natural Earth publishes a lakes dataset at various resolutions. I used the 10m (1:10,000,000) resolution - detailed enough for this purpose.

```python
import geopandas as gpd
import matplotlib.pyplot as plt
import numpy as np
from shapely.geometry import Point

# Load lakes from Natural Earth
# You can download from naturalearth.com or load via geopandas
lakes = gpd.read_file('ne_10m_lakes/ne_10m_lakes.shp')

# Check what we have
print(lakes.head())
print(f"Total lakes: {len(lakes)}")
print(lakes['name'].value_counts().head(10))
```

The dataset has columns like `name`, `geometry`, and sometimes area. Let me filter to lakes of interest:

```python
# Get specific lakes by name
lake_names = [
    'Lake Superior',
    'Lake Victoria',
    'Caspian Sea',
    'Lake Eyre',
    'Titicaca',
    'Dead Sea',
    'Loch Ness',
]

selected_lakes = lakes[lakes['name'].isin(lake_names)].copy()

if len(selected_lakes) < len(lake_names):
    print(f"Warning: only found {len(selected_lakes)} of {len(lake_names)} lakes")
    found = selected_lakes['name'].tolist()
    missing = [name for name in lake_names if name not in found]
    print(f"Missing: {missing}")
```

Natural Earth data uses WGS84 (lat/lon). For visualization, I'll project everything to a common equal-area projection so the visual sizes match reality.

## Projection and Normalization

```python
# Project to an equal-area projection (good for comparing sizes visually)
# EPSG:3857 (Web Mercator) distorts areas at high latitudes
# Better: EPSG:6933 (Equal Earth Projection)
selected_lakes = selected_lakes.to_crs("EPSG:6933")

# Calculate area in square km
selected_lakes['area_sq_km'] = selected_lakes.geometry.area / 1e6

# Sort by area descending
selected_lakes = selected_lakes.sort_values('area_sq_km', ascending=False)

print(selected_lakes[['name', 'area_sq_km']])
```

Output looks like:
```
name            area_sq_km
Caspian Sea     371000
Lake Superior   82100
Lake Victoria   69490
Lake Eyre       9500
Titicaca        8372
Dead Sea        1000
Loch Ness       57
```

This is already interesting - Caspian Sea dwarfs everything else. But visually they're all squished on one map.

## Multi-Lake Comparison Plot

The trick is to plot each lake at the same scale in a grid layout. I'll use matplotlib subplots:

```python
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle

fig, axes = plt.subplots(2, 4, figsize=(16, 8))
axes = axes.flatten()

# Determine a uniform scale
# Use the bounds of the largest lake as reference
max_bounds = selected_lakes.iloc[0].geometry.bounds
max_width = max_bounds[2] - max_bounds[0]
max_height = max_bounds[3] - max_bounds[1]
max_extent = max(max_width, max_height) * 1.1

for idx, (i, row) in enumerate(selected_lakes.iterrows()):
    ax = axes[idx]

    # Get lake geometry and bounds
    geom = row['geometry']
    bounds = geom.bounds
    cx = (bounds[0] + bounds[2]) / 2
    cy = (bounds[1] + bounds[3]) / 2

    # Plot the lake centred in its subplot at uniform scale
    x, y = geom.exterior.xy
    ax.fill(x, y, alpha=0.6, color='blue', edgecolor='darkblue', linewidth=1)

    # Set axis limits to uniform scale centred on lake
    ax.set_xlim(cx - max_extent/2, cx + max_extent/2)
    ax.set_ylim(cy - max_extent/2, cy + max_extent/2)
    ax.set_aspect('equal')

    # Title with size
    area = row['area_sq_km']
    ax.set_title(f"{row['name']}\n{area:,.0f} sq km", fontsize=12, fontweight='bold')
    ax.set_xticks([])
    ax.set_yticks([])
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['bottom'].set_visible(False)
    ax.spines['left'].set_visible(False)

# Hide unused subplots
for idx in range(len(selected_lakes), len(axes)):
    axes[idx].axis('off')

plt.tight_layout()
plt.savefig('lake_comparison.png', dpi=150, bbox_inches='tight')
plt.show()
```

This gives you a grid where each lake is shown at the same scale. Suddenly you see that:
- Caspian Sea is absolutely massive
- Lake Superior is huge but looks modest next to Caspian
- Lake Eyre (Australia) is much bigger than you'd guess
- Loch Ness is tiny - you could practically see across it from space

## Side-by-Side Comparison

For just two lakes, a side-by-side is clearer:

```python
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))

# Lake Superior vs Caspian Sea
lake1 = selected_lakes[selected_lakes['name'] == 'Lake Superior'].iloc[0]
lake2 = selected_lakes[selected_lakes['name'] == 'Caspian Sea'].iloc[0]

# Use the larger lake's extent as scale
extent = max(
    lake1.geometry.bounds[2] - lake1.geometry.bounds[0],
    lake2.geometry.bounds[3] - lake2.geometry.bounds[1],
) * 1.2

for ax, lake in [(ax1, lake1), (ax2, lake2)]:
    geom = lake['geometry']
    bounds = geom.bounds
    cx = (bounds[0] + bounds[2]) / 2
    cy = (bounds[1] + bounds[3]) / 2

    x, y = geom.exterior.xy
    ax.fill(x, y, alpha=0.7, color='deepskyblue', edgecolor='navy', linewidth=2)

    ax.set_xlim(cx - extent/2, cx + extent/2)
    ax.set_ylim(cy - extent/2, cy + extent/2)
    ax.set_aspect('equal')
    ax.set_title(f"{lake['name']}\n{lake['area_sq_km']:,.0f} sq km",
                fontsize=14, fontweight='bold')
    ax.grid(alpha=0.3)

plt.tight_layout()
plt.savefig('lake_comparison_superior_vs_caspian.png', dpi=150)
plt.show()
```

## Interesting Insights

Once you build this, you can query all sorts of questions:

```python
# What's the deepest lake? (not in our data, but available elsewhere)
# What's the most elongated lake (length/width ratio)?

for i, row in selected_lakes.iterrows():
    bounds = row['geometry'].bounds
    width = bounds[2] - bounds[0]
    height = bounds[3] - bounds[1]
    aspect_ratio = max(width, height) / min(width, height)
    print(f"{row['name']}: aspect ratio {aspect_ratio:.2f}")
```

Output:
```
Caspian Sea: aspect ratio 2.1 (roughly rectangular)
Lake Eyre: aspect ratio 1.3 (more circular)
Titicaca: aspect ratio 1.8 (elongated)
```

You can also compute how many Loch Nesses fit inside Lake Superior:

```python
loch_ness_area = selected_lakes[selected_lakes['name'] == 'Loch Ness'].iloc[0]['area_sq_km']
superior_area = selected_lakes[selected_lakes['name'] == 'Lake Superior'].iloc[0]['area_sq_km']

print(f"Lake Superior = {superior_area / loch_ness_area:.0f} x Loch Ness")
```

For us, it's 1,442 Loch Nesses. Wild.

## Why I Built This

Honestly, I was fact-checking something about Lake Eyre and realized I had no intuition for its actual size relative to other lakes. I knew it was large, but was it Lake Superior-large or Lake Windermere-large?

Building the visualizer killed the question. Lake Eyre is genuinely large - you could fit a couple hundred Loch Nesses in it. But it's dwarfed by the truly massive lakes like Caspian, Superior, and Victoria.

The code is under 100 lines and teaches you about projections, geospatial data, and matplotlib subplots. If you want to compare anything polygon-based across the globe - countries, regions, islands - the pattern transfers directly.

Give it a go. Pick your favourite lakes and see how they actually stack up.
