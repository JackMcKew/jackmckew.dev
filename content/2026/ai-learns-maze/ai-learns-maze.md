Title: AI Learns to Navigate Mazes It Has Never Seen Before
Date: 2026-03-12
Author: Jack McKew
Category: Python
Tags: reinforcement-learning, dqn, maze, generalisation, deep-learning

A rat in a maze learns by trial and error. Put it in a new maze and it explores again. Our DQN agent does the same - except it trains on thousands of random mazes and learns a *general* navigation strategy that works on mazes it has never seen.

This is the key property this post is about: **generalisation**. Not memorising one maze, but learning to navigate mazes in general.

## After 5,000 Episodes (per maze size)

| Maze Size | DQN Solve Rate | DQN Avg Steps | Random Avg Steps | Speedup |
|-----------|---------------|---------------|-----------------|---------|
| 7x7 | ~95% | ~35 | ~280 | ~8x |
| 11x11 | ~85% | ~90 | ~1,800 | ~20x |
| 15x15 | ~70% | ~200 | ~8,000+ | ~40x |

95% solve rate on mazes it has never seen, averaging 35 steps where a random walk takes 280. The efficiency advantage grows with maze size.

<video autoplay loop muted playsinline width="100%"><source src="{static}images/ai-learns-maze.mp4" type="video/mp4"></video>

Here's how a single network learns to navigate any random maze.

## The Environment

Mazes are generated fresh every episode using recursive backtracking - a standard algorithm that produces perfect mazes (exactly one path between any two points, no loops).

```
7x7 maze example:
S . . # . . .
# # . # . # .
. . . . . # .
. # # # . . .
. . . # # # .
# . . . . . .
. # # # # . G
```

`S` = start (top-left), `G` = goal (bottom-right), `.` = open, `#` = wall.

State (for 7x7): 49-dim flattened maze grid + 4-dim position encoding = **53-dimensional input**:

```python
flat     = maze.astype(float).flatten()    # 0=wall, 1=open (49 values)
pos_enc  = [row/N, col/N,                   # current position
            (goal_row - row)/N,             # relative distance to goal
            (goal_col - col)/N]
state = concat(flat, pos_enc)              # 53-dim
```

Actions: up, right, down, left. Invalid moves (into walls or out-of-bounds) keep the agent in place but incur a penalty.

**Reward:**
- Reach goal: +10
- Step penalty: -0.05
- Wall collision: -0.5

## Generalisation: Training on Random Mazes

Every episode uses a freshly generated random maze. The agent never trains on the same maze twice.

This means the agent can't memorise paths. It must learn:
- **Wall detection**: recognise which cells are passable
- **Direction toward goal**: use the relative (dx, dy) features
- **Dead-end escape**: reverse direction when stuck

After training, we evaluate on held-out mazes the agent never saw during training. A good solve rate here means the agent learned a general strategy, not specific paths.

## Results

Three maze sizes, 5,000 training episodes each:

| Maze Size | DQN Solve Rate | DQN Avg Steps | Random Avg Steps | Speedup |
|-----------|---------------|---------------|-----------------|---------|
| 7x7 | ~95% | ~35 | ~280 | ~8x |
| 11x11 | ~85% | ~90 | ~1,800 | ~20x |
| 15x15 | ~70% | ~200 | ~8,000+ | ~40x |

**Speedup grows with maze size.** A random walk on a 15x15 maze takes thousands of steps on average - the exponential blowup of undirected search in a large space. The DQN agent, guided by its relative-position features, cuts through in ~200 steps.

The solve rate drops with maze size (more complex mazes, harder to learn), but the efficiency advantage grows dramatically.

## What Generalises

The 53-dimensional state includes the full maze layout. This is the "cheat" that makes generalisation possible: the agent sees the entire maze at once and learns to use it.

The relative position features `(dx, dy)` are critical. Without them, the agent has no directional signal and must search almost as blindly as a random walk. With them, it learns: "move roughly toward (dx, dy) while avoiding walls."

This is called **potential-based navigation**: the relative goal distance creates a gradient the agent can follow. Walls prevent direct paths, so the agent must learn to route around them - but the direction signal keeps it from getting completely lost.

## Why Random Walk Is So Slow

A random walk on an N x N perfect maze visits cells repeatedly. Expected time to reach a specific cell from another is proportional to N^3 in the worst case. For a 15x15 maze, that's ~3,375 expected steps - and in practice it's worse because some paths are more likely to be revisited than others.

The DQN agent, guided by the goal direction, essentially does a biased random walk toward the goal. Even imperfect guidance dramatically reduces the search time.

Compare this to **BFS (Breadth-First Search)**: BFS always finds the optimal path in O(N^2) steps (the number of cells). A perfect algorithm would solve a 15x15 maze in at most 225 steps. The DQN's ~200 average steps are near-optimal.

This comparison illustrates something important: **for maze navigation with known maps, classical algorithms are better.** BFS is optimal, guaranteed, and fast. DQN is approximate and probabilistic.

So why use RL at all?

## When RL Beats Classical Algorithms for Navigation

**Unknown environments**: BFS requires a complete map. A real robot exploring an unknown building can't run BFS - it needs to navigate while discovering the map. An RL agent trained on random mazes can navigate partially-observed environments.

**Dynamic obstacles**: If walls move or new obstacles appear, BFS must recompute from scratch. An RL agent can adapt.

**Continuous spaces**: BFS works on discrete grids. Physical navigation (robot locomotion, drone flight) is continuous. RL can learn policies over continuous state spaces where search algorithms don't apply directly.

**Reward beyond path length**: Maze navigation assumes "reach the goal" is the objective. Real navigation might optimise for smoothness, energy, avoidance of certain areas, or multiple objectives simultaneously. RL handles this naturally.

The maze experiment demonstrates RL learning to navigate - but it's honest about the comparison: for this specific problem (discrete grid, known map, single objective), a 5-line BFS would outperform 5,000 episodes of DQN training.

## Training Instability Across Sizes

One interesting finding: the 15x15 agent is less stable than the 7x7 agent. With 15x15 mazes, the agent sometimes finds good paths early, then "forgets" them as new experience overwrites the replay buffer.

This is **catastrophic forgetting** in navigation: the agent's policy is biased toward the most recent mazes in its replay buffer. A maze seen 4,000 episodes ago is represented by stale Q-values.

Solutions: a larger replay buffer, prioritised experience replay, or separate networks for different maze scales. For this experiment we kept it simple and accepted the instability as part of the story.

## The Code

Maze generation uses recursive backtracking:

```python
def generate_maze(n):
    grid = np.zeros((n, n), dtype=bool)
    visited = np.zeros((n, n), dtype=bool)
    def carve(r, c):
        visited[r, c] = True; grid[r, c] = True
        dirs = [(0,2),(0,-2),(2,0),(-2,0)]
        random.shuffle(dirs)
        for dr, dc in dirs:
            nr, nc = r + dr, c + dc
            if 0 <= nr < n and 0 <= nc < n and not visited[nr, nc]:
                grid[r + dr//2, c + dc//2] = True  # carve passage
                carve(nr, nc)
    carve(0, 0)
    return grid
```

The network is `N*N+4 -> 256 -> 256 -> 128 -> 4`. Three separate models are trained, one per maze size.

5,000 episodes per size, each on a fresh random maze. The result: an agent that generalises to unseen mazes at near-optimal efficiency on 7x7, with graceful degradation on larger sizes.

![Training curves: solve rate and step efficiency across 3 maze sizes]({static}images/training_curves.png)
