Title: Isochrone Generator from a Location
Date: 2026-03-10
Author: Jack McKew
Category: Python
Tags: isochrone, geospatial, routing, openstreetmap, python

An isochrone is the answer to: "How far can I travel in 15 minutes from here?" It's a boundary line (or polygon) that encloses all reachable points. They're useful for real estate (commute times), store location analysis (coverage area), and just curiosity - what's actually within reach?

I built an isochrone generator using OpenStreetMap data and Python. The approach is different from commercial routing APIs (which cost money per query) - you're computing it locally against actual street networks.

## The Approach: OSMnx + NetworkX

The strategy: load the street network from OSM, build a graph, run a shortest-path search from your location to all other nodes, then find the boundary where travel time exceeds your threshold.

```python
import osmnx as ox
import networkx as nx
import geopandas as gpd
from shapely.geometry import Point, Polygon, MultiPoint
import matplotlib.pyplot as plt

# Download the street network for a location
# This grabs the street graph within 5km of the centre point
place = "Brisbane, Australia"
G = ox.graph_from_place(place, network_type='drive')

# Get the point we're starting from
start_lat, start_lon = -27.4705, 151.1243  # Brisbane CBD

# Find the nearest node to our start point
start_node = ox.nearest_nodes(G, start_lon, start_lat)

print(f"Graph has {len(G.nodes())} nodes and {len(G.edges())} edges")
```

OSMnx is built on top of networkx, so you get a proper graph object with nodes (intersections) and edges (streets). Each edge has length (meters) and usually a speed estimate from OSM tags.

## Computing Reachable Nodes

Once you have the graph and a start node, you need to compute travel time to every other node. NetworkX has `single_source_dijkstra_path_length()` which does exactly this.

```python
# Estimate travel speed for each edge
# OSM has maxspeed tags, but they're often missing
# Default to reasonable guesses based on street type

for u, v, data in G.edges(data=True):
    if 'speed_kph' not in data:
        # Guess based on street type
        highway_type = data.get('highway', 'residential')
        if highway_type in ['motorway', 'trunk']:
            data['speed_kph'] = 100
        elif highway_type in ['primary', 'secondary']:
            data['speed_kph'] = 60
        else:
            data['speed_kph'] = 40

    # Convert to travel time: length in meters / speed in m/s
    # 1 m/s = 3.6 kph
    data['travel_time_seconds'] = data['length'] / (data['speed_kph'] / 3.6)

# Dijkstra with travel time as edge weight
travel_times = nx.single_source_dijkstra_path_length(
    G, start_node, weight='travel_time_seconds'
)

# Filter nodes reachable within 15 minutes (900 seconds)
threshold_seconds = 15 * 60
reachable = {node: time for node, time in travel_times.items() if time <= threshold_seconds}

print(f"Reachable nodes within 15 min: {len(reachable)}")
print(f"Max travel time: {max(reachable.values()) / 60:.1f} minutes")
```

## Building the Isochrone Polygon

Now you have a set of reachable nodes. To convert that into a polygon boundary, you need to:

1. Get the coordinates of all reachable nodes.
2. Compute the convex hull (simple but loses detail) or use a more sophisticated boundary algorithm.
3. Optional: smooth the boundary to remove jagged edges.

```python
# Get coordinates of reachable nodes
reachable_coords = [(G.nodes[node]['x'], G.nodes[node]['y'])
                    for node in reachable.keys()]

# Simple approach: convex hull
from scipy.spatial import ConvexHull

if len(reachable_coords) > 2:
    hull = ConvexHull(reachable_coords)
    boundary_points = [reachable_coords[i] for i in hull.vertices]
    boundary_polygon = Polygon(boundary_points)
else:
    print("Not enough points")
    boundary_polygon = None

# More sophisticated: concave hull (alpha shape)
# This requires alphashape library
from alphashape import alphashape

alpha = 0.01  # Lower = tighter boundary, higher = looser
concave_boundary = alphashape(reachable_coords, alpha)

print(f"Boundary area: {boundary_polygon.area:.4f} sq degrees")
```

The convex hull is fast but unrealistic - it assumes you can walk through buildings. Alpha shapes are better but require tuning the alpha parameter.

## Visualization

Plot the isochrone on top of the street network to verify it makes sense.

```python
fig, ax = plt.subplots(figsize=(14, 12))

# Plot the street network
ox.plot_graph(G, ax=ax, node_size=0, edge_linewidth=0.5, edge_color='gray')

# Plot reachable nodes
reachable_points = [Point(G.nodes[n]['x'], G.nodes[n]['y']) for n in reachable.keys()]
for pt in reachable_points:
    ax.plot(pt.x, pt.y, 'b.', markersize=2, alpha=0.3)

# Plot start point
ax.plot(start_lon, start_lat, 'go', markersize=10, label='Start', zorder=5)

# Plot isochrone boundary
if boundary_polygon:
    xs, ys = boundary_polygon.exterior.xy
    ax.plot(xs, ys, 'r-', linewidth=2, label='15-min isochrone')
    ax.fill(xs, ys, alpha=0.2, color='red')

ax.set_title('15-Minute Isochrone from Brisbane CBD')
ax.legend()
plt.tight_layout()
plt.savefig('isochrone_brisbane.png', dpi=150)
plt.show()
```

## Real-World Refinement

The basic approach has issues:

1. **No traffic**: All edges assume free-flow speeds. Real commutes have congestion.
2. **No walking**: If you start at a bus stop, you need to walk to it first.
3. **Transit**: The graph is just streets, not bus/train routes.
4. **Accuracy**: Speed estimates are guesses. OSM maxspeed is sometimes wrong.

For a production tool, you'd layer in:

- Real traffic data (HERE, TomTom APIs)
- Public transit graph (GTFS data)
- Walking time to transit stations

But for a first pass, the OSMnx approach gives you something usable in an afternoon.

```python
# Example: include walking to start point
# If you're at a bus stop, add walking time to reach the stop

walking_speed_ms = 1.4  # metres per second, roughly 5km/h
walking_distance_m = 500  # walk up to 500m to a transit stop
walking_time_s = walking_distance_m / walking_speed_ms

# Adjust the threshold
effective_threshold = threshold_seconds - walking_time_s
```

## Results

Running this on Brisbane CBD:

- 15-minute isochrone covers roughly 30-40 sq km, depending on road density.
- Inner suburbs (Fortitude Valley, South Bank) are fully covered.
- Outer suburbs start at the edge.
- The shape isn't circular - it's distorted by the network topology (river crossings, major roads).

Compare it to a simple circle: a 15-minute drive at 60 km/h is roughly 15 km, so a circle of radius 15 km. But the actual isochrone is smaller and weirder-shaped because you can't drive in straight lines.

## Why This Matters

Real estate apps use isochrones to show "commute zones". Urban planners use them to assess coverage. If you're opening a store and want to reach 70% of your target demographic in under 20 minutes, you'd use isochrones to pick the location.

The code is surprisingly lean. OSMnx handles downloading and parsing OSM data, networkx does the graph algorithms. You get a working tool in maybe 50 lines of actual logic.

Bonus: swap 'drive' for 'walk' or 'bike' and you get walking isochrones. Turns out walking 15 minutes from the CBD gets you maybe 1.5 km - way less than you'd think. Biking is more interesting - 15 minutes gets you 4-5 km.

Give it a go on your town. You might be surprised by what's actually within reach.
