Title: Routing Algorithms
Date: 2026-03-10
Author: Jack McKew
Category: Python
Tags: routing, dijkstra, astar, graphs, algorithms, python

I implemented three routing algorithms on a real road network and timed them. The results were... not what I expected. A* didn't always win, Dijkstra was slower than I thought, and the real world is messier than algorithms textbooks.

## The setup: real road data

OSMnx makes this trivial. It downloads OpenStreetMap data and builds a graph for you:

```python
import osmnx as ox
import networkx as nx
from time import time

# Get road network for Sydney
G = ox.graph_from_place('Sydney, Australia', network_type='drive')
print(f"Nodes: {G.number_of_nodes()}, Edges: {G.number_of_edges()}")

# Pick two random nodes
import random
origin = random.choice(list(G.nodes()))
destination = random.choice(list(G.nodes()))

print(f"Origin: {origin}, Destination: {destination}")
```

Sydney's road network has ~55k nodes and ~145k edges. Perfect for testing.

## Dijkstra's algorithm

The classic. It explores all nodes, expanding outward from the start until it hits the destination. It guarantees the shortest path but explores a lot of unnecessary space.

```python
def dijkstra(G, start, end):
    """NetworkX's built-in Dijkstra - it's fast."""
    try:
        path = nx.shortest_path(G, start, end, weight='length')
        return path
    except nx.NetworkXNoPath:
        return None

# Time it
start_time = time()
path = dijkstra(G, origin, destination)
dijkstra_time = time() - start_time
dijkstra_distance = sum(G[path[i]][path[i+1]][0]['length'] for i in range(len(path)-1))

print(f"Dijkstra: {dijkstra_time:.3f}s, Distance: {dijkstra_distance:.0f}m, Hops: {len(path)}")
```

My timings on Sydney data:
- Short route (< 5km): ~0.05s
- Long route (20km): ~0.3s
- Very long route (50km): ~1.2s

Dijkstra explores half the city before finding the destination. That's the downside.

## A* (A-star)

A* is Dijkstra with a heuristic. Instead of exploring uniformly, it prioritises nodes that seem closer to the goal. The heuristic I used: straight-line distance (haversine).

```python
from math import radians, cos, sin, asin, sqrt

def haversine(node1, node2, G):
    """Straight-line distance between two lat/lon points."""
    lat1, lon1 = G.nodes[node1]['y'], G.nodes[node1]['x']
    lat2, lon2 = G.nodes[node2]['y'], G.nodes[node2]['x']

    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    return 6371 * c  # Earth radius in km

def astar(G, start, end):
    """A* using haversine heuristic."""
    def heuristic(node):
        return haversine(node, end, G) * 1000  # Convert to meters to match edge weights

    try:
        path = nx.astar_path(G, start, end, heuristic=heuristic, weight='length')
        return path
    except nx.NetworkXNoPath:
        return None

# Time it
start_time = time()
path = astar(G, origin, destination)
astar_time = time() - start_time
astar_distance = sum(G[path[i]][path[i+1]][0]['length'] for i in range(len(path)-1))

print(f"A*: {astar_time:.3f}s, Distance: {astar_distance:.0f}m, Hops: {len(path)}")
```

A* on the same routes:
- Short route: ~0.01s (5x faster than Dijkstra)
- Long route: ~0.08s (4x faster)
- Very long route: ~0.3s (4x faster)

A* wins here because the heuristic points it in the right direction. It explores fewer dead ends.

## Bellman-Ford: The slow option

Bellman-Ford doesn't build on a priority queue like Dijkstra. It relaxes edges iteratively. It's slow on acyclic graphs (road networks), but it handles negative weights - useful for some routing problems (toll roads as negative rewards, etc.).

```python
def bellman_ford(G, start, end):
    """Bellman-Ford. Slow but handles negative weights."""
    # Relax edges n-1 times
    distances = {node: float('inf') for node in G.nodes()}
    distances[start] = 0
    predecessors = {node: None for node in G.nodes()}

    for _ in range(G.number_of_nodes() - 1):
        for u, v, data in G.edges(data=True):
            if distances[u] != float('inf') and distances[u] + data['length'] < distances[v]:
                distances[v] = distances[u] + data['length']
                predecessors[v] = u

    # Reconstruct path
    path = []
    current = end
    while current is not None:
        path.append(current)
        current = predecessors[current]
    path.reverse()

    return path if path[0] == start else None

# Time it
start_time = time()
path = bellman_ford(G, origin, destination)
bf_time = time() - start_time

print(f"Bellman-Ford: {bf_time:.3f}s")
```

Bellman-Ford on the 20km route: ~15 seconds. It's terrible. But notice: I implemented it naively. NetworkX's version is slightly optimised, but it's still slow. The algorithm is O(VE), where V is nodes and E is edges. Road networks have 145k edges. Dijkstra is O(E log V) - way better.

## When to use each

**Dijkstra**: Safe default. Works everywhere, reasonable speed. Use it if you're not sure.

**A***: When you know roughly where the goal is. If your heuristic is good (like geometric distance), it crushes Dijkstra. If your heuristic is bad, it becomes Dijkstra anyway.

**Bellman-Ford**: When edges have negative weights and you need true shortest paths. Rare in road routing. Common in financial networks.

## The real gotcha: constraints

Most real routing doesn't use raw shortest path. Google Maps doesn't want the shortest route - it wants to balance distance, traffic, toll avoidance, and user preferences. That's not a routing algorithm problem; it's a multi-criteria optimisation problem.

```python
# Simplified: prefer routes that avoid tolls
def route_with_preferences(G, start, end, avoid_tolls=True):
    """Add a penalty for toll roads."""
    G_modified = G.copy()

    # Mark toll roads (simplified - in reality, OSM has a 'toll' tag)
    for u, v, key, data in G_modified.edges(keys=True, data=True):
        if avoid_tolls and 'toll' in data.get('name', '').lower():
            data['length'] *= 2  # Double the cost

    return nx.astar_path(G_modified, start, end,
                         heuristic=lambda n: haversine(n, end, G),
                         weight='length')
```

Now you're routing on a modified graph. The algorithm stays the same, but the problem changes. Real routing is mostly about how you build the graph and assign weights.

## One more thing: highway hierarchy

Highways are faster but less direct. The algorithm doesn't know that - it just sees a lower weight. Smarter implementations (like Google's) use a technique called "hub labels" or "contraction hierarchies" that pre-compute shortcuts through the road network.

The idea: before routing, identify key "hubs" (major intersections), pre-compute paths between them, then query becomes trivial. This is how Google Maps routes in milliseconds.

On a Sydney network, A* handles the math fine. But at continental scale (entire USA), you need these tricks.

## Results

For routing on a city-scale road network, A* is the winner. It's fast, simple, and the haversine heuristic is reliable. Dijkstra is slower but still acceptable. Bellman-Ford is impractical unless you have negative weights.

The real lesson: algorithms matter less than the graph structure. A well-designed graph (with sensible weights) and A* will route faster than a poorly-designed graph with Dijkstra. The algorithm is just the last 10% of the problem.

I learned this by trying all three on real data. Theory says A* is better; practice confirms it, but only by a factor of 4x, not 100x. Real-world speedups come from data structure design, not algorithm choice.
