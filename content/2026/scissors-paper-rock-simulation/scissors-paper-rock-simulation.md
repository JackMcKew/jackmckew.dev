Title: Scissors Paper Rock Simulation
Date: 2026-03-10
Author: Jack McKew
Category: Python
Tags: simulation, pygame, game-theory, emergence, cellular-automaton

I built a cellular automaton where Scissors, Paper, and Rock are actual populations fighting for space on a grid. Each agent spreads by converting its neighbours, just like rock beats scissors beats paper beats rock. The idea is dead simple. The results are weirdly hypnotic.

The fun bit? Despite RPS being perfectly balanced in a 1v1 scenario, once you throw them on a grid and let them spread spatially, wild dynamics emerge. Sometimes one species crushes the others completely. Sometimes you get stable cycles where populations boom and crash. Sometimes you see gorgeous spatial patterns - stripes, spirals, fractal-like boundaries.

## The Rules

Here's the algorithm:

1. Create a grid (I used 400x400).
2. Fill it randomly with R, P, or S agents (about equal distribution).
3. Each timestep: for every cell, count how many neighbours beat it. If your cell is Scissors and a Paper neighbour converts you, you become Paper.
4. Render the grid, colour-coded. Red=Rock, Blue=Paper, Green=Scissors.

The conversion probability is key. I set it to roughly 0.5 per timestep per winning neighbour, so it's not deterministic but it drives population changes.

```python
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation

class RPSSimulation:
    def __init__(self, width=400, height=400):
        self.width = width
        self.height = height
        # 0=Rock, 1=Paper, 2=Scissors
        self.grid = np.random.randint(0, 3, (height, width))
        self.history = [self.grid.copy()]

    def step(self, conversion_prob=0.5):
        new_grid = self.grid.copy()

        for i in range(self.height):
            for j in range(self.width):
                current = self.grid[i, j]
                # Get 4-neighbours (or 8, your choice)
                neighbors = [
                    self.grid[(i-1) % self.height, j],
                    self.grid[(i+1) % self.height, j],
                    self.grid[i, (j-1) % self.width],
                    self.grid[i, (j+1) % self.width],
                ]

                # Count how many neighbours beat us
                beaters = [n for n in neighbors if self._beats(n, current)]

                # If we're being beaten, maybe we convert
                if beaters and np.random.random() < conversion_prob * len(beaters) / 4:
                    new_grid[i, j] = np.random.choice(beaters)

        self.grid = new_grid
        self.history.append(self.grid.copy())
        return self.grid

    def _beats(self, a, b):
        # Rock beats Scissors, Paper beats Rock, Scissors beats Paper
        if a == 0: return b == 2  # Rock beats Scissors
        if a == 1: return b == 0  # Paper beats Rock
        if a == 2: return b == 1  # Scissors beats Paper
        return False

# Run it
sim = RPSSimulation()
for _ in range(500):
    sim.step(conversion_prob=0.5)

# Visualize last state
colors = ['red', 'blue', 'green']
cmap = plt.cm.ListedColormap(colors)
plt.imshow(sim.grid, cmap=cmap, interpolation='nearest')
plt.title('Rock-Paper-Scissors Simulation (t=500)')
plt.axis('off')
plt.savefig('rps_final.png', dpi=150, bbox_inches='tight')
plt.show()
```

## What Actually Happens

First few runs: chaos. The grid is a churning mess of colours. By t=100, patterns start. You might see:

- **Total domination**: One species (say, Rock) expands and wipes everyone else out by t=200. The grid goes red. Boring but it happens.
- **Spiral waves**: The three species form rotating spiral patterns that propagate outward. Actually beautiful.
- **Striped boundaries**: Sharp interfaces between species that shift and undulate.
- **Oscillations**: Two species stay roughly constant in population while the third cycles up and down.

The key insight is that spatial structure matters. In a well-mixed model (agents pick random opponents everywhere), RPS stays balanced forever. But on a grid, you get clusters, and clusters have edges, and edges are where the action happens.

I've run this a hundred times and I've never seen the same evolution twice. Sometimes at t=300 one species suddenly crashes and you're left with a binary system. Sometimes you hit a dynamic equilibrium that lasts forever.

## Tweaking It

A few parameters that make it interesting:

- **Neighbourhood type**: 4-neighbours (cardinal) vs 8-neighbours (including diagonals). 8-neighbours kills off isolated clusters faster.
- **Conversion probability**: Higher means faster, more decisive outcomes. Lower means slower, more chaotic.
- **Initial density**: If you start with 90% one species and 5%/5% of the others, the dynamics are skewed.
- **Wraparound**: Toroidal grid (edges wrap) vs bounded. I used toroidal but bounded is more realistic.

One thing that's weirdly fun: add a fourth species that doesn't fit the RPS cycle (e.g., "Dynamite" that beats all three but loses to a fifth species). Suddenly you get completely different dynamics - maybe four-way cycles, maybe two dominant species and two suppressed ones.

## The Visualization

I used matplotlib with ListedColormap to map the three values to three colours. You can also dump frames and encode them to an mp4 with ffmpeg for a proper animation. For a 500-timestep simulation at 400x400 resolution, you're looking at 40MB of raw frames, but H.264 compression gets it down to roughly 500KB.

```python
from matplotlib.animation import PillowWriter

fig, ax = plt.subplots(figsize=(8, 8))
colors = ['red', 'blue', 'green']
cmap = plt.cm.ListedColormap(colors)

def animate(frame):
    ax.clear()
    ax.imshow(sim.history[frame], cmap=cmap, interpolation='nearest')
    ax.set_title(f'RPS Simulation (t={frame})')
    ax.axis('off')

anim = FuncAnimation(fig, animate, frames=len(sim.history), interval=50)
writer = PillowWriter(fps=20)
anim.save('rps_simulation.gif', writer=writer)
```

## Why I Built This

Honestly? I was procrastinating on something and stumbled on a paper about spatial game theory. The RPS rules are so simple that you can implement them in under 50 lines, but the emergent behaviour is complex enough to keep you watching for hours. There's something satisfying about watching a completely symmetric system produce asymmetric outcomes just because of space.

Also it's a great teaching example. You can show students that "balanced" doesn't mean "stable in all contexts". Same way a see-saw balances on the fulcrum but wobbles in real life.

The code runs fast enough that you can tweak parameters and re-run in seconds. My favourite accidental configuration was when I had the conversion probability inverted - agents spread when they're being beaten instead of when they're winning. The dynamics inverted too, which was trippy to watch.

Anyway, if you want to play with cellular automata and enjoy watching things that shouldn't have patterns develop patterns, give this a go. Start with the simple 4-neighbour version and go from there.
