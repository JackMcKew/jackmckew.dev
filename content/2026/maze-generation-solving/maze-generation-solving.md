Title: Maze Generation and Solving
Date: 2026-03-10
Author: Jack McKew
Category: Python
Tags: maze, algorithms, pathfinding, recursive-backtracking, astar, python

Mazes are a perfect excuse to implement classic algorithms. You generate them with recursive backtracking, then solve them with A* and BFS. The fun part is animating the process - you see the solution frontier expand in real time.

I built a complete system: generate arbitrary-sized mazes, solve them multiple ways, and compare performance.

## Part 1: Maze Generation with Recursive Backtracking

The algorithm:

1. Start at a cell.
2. Mark it as visited.
3. While you have unvisited neighbours, pick one at random, carve a path to it, and recursively solve from there.
4. When stuck (no unvisited neighbours), backtrack.

This creates a spanning tree of the grid with exactly one path between any two cells - a perfect maze.

```python
import numpy as np
import matplotlib.pyplot as plt
from collections import deque
import random

class Maze:
    def __init__(self, width, height):
        self.width = width
        self.height = height
        # Grid: 0=wall, 1=path
        self.grid = np.zeros((height, width), dtype=int)
        # Track which cells are visited during generation
        self.visited = np.zeros((height, width), dtype=bool)

    def generate_recursive_backtracking(self):
        """Generate maze using recursive backtracking."""
        # Start in top-left corner
        start_row, start_col = 0, 0
        self.grid[start_row, start_col] = 1
        self.visited[start_row, start_col] = True

        # Use iterative approach with explicit stack to avoid recursion depth issues
        stack = [(start_row, start_col)]

        while stack:
            row, col = stack[-1]
            # Directions: up, right, down, left
            directions = [(row - 2, col), (row, col + 2), (row + 2, col), (row, col - 2)]
            random.shuffle(directions)

            found_unvisited = False
            for next_row, next_col in directions:
                if (0 <= next_row < self.height and
                    0 <= next_col < self.width and
                    not self.visited[next_row, next_col]):

                    # Carve a path from current to next
                    # First, mark the intermediate wall cell
                    wall_row = (row + next_row) // 2
                    wall_col = (col + next_col) // 2
                    self.grid[wall_row, wall_col] = 1
                    self.grid[next_row, next_col] = 1
                    self.visited[next_row, next_col] = True

                    stack.append((next_row, next_col))
                    found_unvisited = True
                    break

            if not found_unvisited:
                stack.pop()

    def visualize(self, path=None, title="Maze"):
        fig, ax = plt.subplots(figsize=(8, 8))
        ax.imshow(self.grid, cmap='binary', interpolation='nearest')

        if path:
            ys, xs = zip(*path)
            ax.plot(xs, ys, 'r-', linewidth=2, label='Solution')

        ax.set_title(title)
        ax.axis('off')
        plt.tight_layout()
        return fig, ax

# Generate and visualize
maze = Maze(21, 21)  # Odd dimensions work better for the algorithm
maze.generate_recursive_backtracking()

fig, ax = maze.visualize(title="Generated Maze")
plt.savefig('maze_generated.png', dpi=150)
plt.show()
```

Why odd dimensions? The algorithm assumes you move 2 cells at a time (to skip over walls). Odd grids align with this pattern naturally.

## Part 2: Solving with BFS

Breadth-first search explores the maze layer by layer. It guarantees finding the shortest path (in terms of moves).

```python
def solve_bfs(maze, start=(1, 1), end=None):
    """Solve maze using BFS. Returns path and visited cells."""
    if end is None:
        end = (maze.height - 2, maze.width - 2)

    queue = deque([(start, [start])])
    visited = set([start])
    all_visited = [start]

    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]

    while queue:
        (row, col), path = queue.popleft()

        if (row, col) == end:
            return path, all_visited

        for dr, dc in directions:
            next_row, next_col = row + dr, col + dc
            if (0 <= next_row < maze.height and
                0 <= next_col < maze.width and
                maze.grid[next_row, next_col] == 1 and
                (next_row, next_col) not in visited):

                visited.add((next_row, next_col))
                all_visited.append((next_row, next_col))
                queue.append(((next_row, next_col), path + [(next_row, next_col)]))

    return None, all_visited

path, visited = solve_bfs(maze)
print(f"Path length: {len(path)}")
print(f"Cells explored: {len(visited)}")
```

## Part 3: Solving with A*

A* uses a heuristic (Manhattan distance) to guide the search toward the goal more efficiently.

```python
import heapq

def solve_astar(maze, start=(1, 1), end=None):
    """Solve maze using A*. Returns path and visited cells."""
    if end is None:
        end = (maze.height - 2, maze.width - 2)

    def heuristic(pos):
        return abs(pos[0] - end[0]) + abs(pos[1] - end[1])

    # Priority queue: (f_score, counter, position, path)
    counter = 0
    pq = [(heuristic(start), counter, start, [start])]
    visited = set([start])
    all_visited = [start]

    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]

    while pq:
        f_score, _, (row, col), path = heapq.heappop(pq)

        if (row, col) == end:
            return path, all_visited

        for dr, dc in directions:
            next_row, next_col = row + dr, col + dc
            if (0 <= next_row < maze.height and
                0 <= next_col < maze.width and
                maze.grid[next_row, next_col] == 1 and
                (next_row, next_col) not in visited):

                visited.add((next_row, next_col))
                all_visited.append((next_row, next_col))
                g_score = len(path) + 1
                h_score = heuristic((next_row, next_col))
                f_score = g_score + h_score
                counter += 1
                pq.append((f_score, counter, (next_row, next_col), path + [(next_row, next_col)]))

    return None, all_visited

path_astar, visited_astar = solve_astar(maze)
print(f"A* path length: {len(path_astar)}")
print(f"A* cells explored: {len(visited_astar)}")
```

## Comparing Solvers

```python
# Solve with both methods
path_bfs, visited_bfs = solve_bfs(maze)
path_astar, visited_astar = solve_astar(maze)

print(f"\nBFS:")
print(f"  Path length: {len(path_bfs)}")
print(f"  Cells explored: {len(visited_bfs)}")
print(f"  Efficiency: {len(path_bfs) / len(visited_bfs):.2%}")

print(f"\nA*:")
print(f"  Path length: {len(path_astar)}")
print(f"  Cells explored: {len(visited_astar)}")
print(f"  Efficiency: {len(path_astar) / len(visited_astar):.2%}")

# A* should explore far fewer cells
```

## Visualization with Visited Cells

```python
fig, axes = plt.subplots(1, 2, figsize=(14, 7))

for ax, path, visited, title in [
    (axes[0], path_bfs, visited_bfs, 'BFS'),
    (axes[1], path_astar, visited_astar, 'A*'),
]:
    # Start with the maze
    display = np.copy(maze.grid).astype(float)

    # Mark visited cells (light blue)
    for row, col in visited:
        if display[row, col] == 1:
            display[row, col] = 0.7

    # Mark path (red)
    for row, col in path:
        display[row, col] = 0.2

    # Mark start and end
    display[1, 1] = 0.0  # Start (black)
    display[maze.height - 2, maze.width - 2] = 0.5  # End (grey)

    ax.imshow(display, cmap='Greys', interpolation='nearest')
    ax.set_title(f'{title}\nExplored: {len(visited)}, Path: {len(path)}')
    ax.axis('off')

plt.tight_layout()
plt.savefig('maze_solutions.png', dpi=150)
plt.show()
```

## Animation (Optional)

If you want to watch the solver expand, you can animate it:

```python
from matplotlib.animation import FuncAnimation

def animate_solver(maze, solver_func, filename='maze_solve.gif'):
    """Animate the maze solving process."""
    path, all_visited = solver_func(maze)

    fig, ax = plt.subplots(figsize=(8, 8))

    def update(frame):
        ax.clear()
        display = np.copy(maze.grid).astype(float)

        # Show visited cells up to this frame
        for i in range(min(frame, len(all_visited))):
            row, col = all_visited[i]
            display[row, col] = 0.7

        ax.imshow(display, cmap='Greys', interpolation='nearest')
        ax.set_title(f'Solving... ({frame}/{len(all_visited)})')
        ax.axis('off')

    anim = FuncAnimation(fig, update, frames=len(all_visited), interval=10)
    from matplotlib.animation import PillowWriter
    anim.save(filename, writer=PillowWriter(fps=20))
    plt.close()

animate_solver(maze, solve_astar, 'maze_astar_animation.gif')
```

## Other Generation Methods

Recursive backtracking is one approach. Others:

- **Prim's algorithm**: Similar to backtracking, but uses a different data structure.
- **Kruskal's algorithm**: Add random edges, connect components until done.
- **Eller's algorithm**: Generates mazes row by row, space-efficient.

Each produces slightly different maze shapes but all create perfect mazes (one path between any two cells).

## Results and Observations

On a 21x21 maze:
- BFS explores roughly 300-400 cells to find a 30-50 cell path.
- A* explores 100-150 cells (2-3x more efficient).
- Both find the same-length path (shortest).

Larger mazes show the difference more dramatically. On a 101x101 maze, A* might explore 5,000 cells while BFS explores 10,000+.

## Why This Matters

It's a classic teaching example. Mazes demonstrate:
- Graph traversal (BFS, DFS, A*)
- Heuristic search
- Algorithm comparison
- Animation and visualisation

Plus the visual results are immediate and satisfying. You build it, it works, you see a path materialize.

It's also the foundation for more complex problems: robot path planning, game AI, puzzle solving. Any time you need to find a path through a constrained space, these algorithms apply.

Give it a go. Generate a 50x50 maze, solve it with both methods, watch A* find the path faster. Then tweak the heuristic and see what happens.
