Title: Spatial Generative Design
Date: 2026-03-10
Author: Jack McKew
Category: Python
Tags: generative-design, spatial, optimisation, grasshopper, python

Generative design for spatial layouts is the fun intersection of algorithms and geometry. The idea: define rules and constraints, let an algorithm iterate through possibilities, and watch it find layouts you wouldn't have thought of.

I've been tinkering with this for a few months - using Python to generate floor plans, parking layouts, and network topologies. It's not as magical as it sounds, but it's legitimately useful.

Let me walk through a concrete example: generating an optimal office floor plan with desks, walkways, and meeting rooms.

## The Setup

We're solving a constrained optimization problem:

- We have a rectangular space (e.g., 100m x 50m)
- We want to place desks (1m x 1m), meeting rooms (3m x 4m), and keep walkways clear
- Constraints: desks must be 2m apart (social distance), meeting rooms need at least 1m clearance, walkways must be 1.5m wide
- Objective: maximize the number of desks while keeping the layout sensible

This is a spatial packing problem. We can solve it with a genetic algorithm or simulated annealing.

Let's use a simpler approach first: grid-based placement with local optimization.

```python
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle
from shapely.geometry import box, Point
from shapely.ops import unary_union

class FloorPlan:
    def __init__(self, width, height):
        self.width = width
        self.height = height
        self.desks = []  # List of (x, y, width, height)
        self.meeting_rooms = []
        self.walkways = []

    def add_desk(self, x, y, width=1, height=1):
        """Add a desk if it doesn't collide with existing elements."""
        new_desk = box(x, y, x + width, y + height)

        # Check collision with existing desks
        for desk in self.desks:
            desk_box = box(desk[0], desk[1], desk[0] + desk[2], desk[1] + desk[3])
            if new_desk.intersects(desk_box):
                return False

        # Check collision with meeting rooms
        for room in self.meeting_rooms:
            room_box = box(room[0], room[1], room[0] + room[2], room[1] + room[3])
            # Add 2m buffer for walkway
            if new_desk.buffer(2).intersects(room_box.buffer(1)):
                return False

        self.desks.append((x, y, width, height))
        return True

    def add_meeting_room(self, x, y, width=3, height=4):
        """Add a meeting room."""
        new_room = box(x, y, x + width, y + height)

        # Check collision
        for room in self.meeting_rooms:
            room_box = box(room[0], room[1], room[0] + room[2], room[1] + room[3])
            if new_room.intersects(room_box.buffer(0.5)):
                return False

        self.meeting_rooms.append((x, y, width, height))
        return True

    def generate_layout(self):
        """Generate a layout using a simple grid-based placement."""
        # First, add meeting rooms in a structured way
        # Place one every 30m along the long axis
        for i in range(0, int(self.width), 30):
            self.add_meeting_room(i + 2, 2)

        # Now fill in desks
        desk_spacing = 2.5  # Minimum distance between desks
        for x in np.arange(0, self.width, desk_spacing):
            for y in np.arange(10, self.height, desk_spacing):  # Start at y=10 to leave room for walkways
                if self.add_desk(x, y):
                    pass  # Desk added successfully

    def visualize(self):
        """Plot the floor plan."""
        fig, ax = plt.subplots(figsize=(15, 8))

        # Draw boundary
        boundary = Rectangle((0, 0), self.width, self.height, fill=False, edgecolor='black', linewidth=2)
        ax.add_patch(boundary)

        # Draw desks
        for x, y, w, h in self.desks:
            desk = Rectangle((x, y), w, h, fill=True, facecolor='lightblue', edgecolor='black')
            ax.add_patch(desk)

        # Draw meeting rooms
        for x, y, w, h in self.meeting_rooms:
            room = Rectangle((x, y), w, h, fill=True, facecolor='lightcoral', edgecolor='black')
            ax.add_patch(room)

        ax.set_xlim(0, self.width)
        ax.set_ylim(0, self.height)
        ax.set_aspect('equal')
        ax.set_xlabel('X (meters)')
        ax.set_ylabel('Y (meters)')
        ax.set_title(f'Floor Plan - {len(self.desks)} desks')
        plt.grid(True, alpha=0.3)
        plt.show()

# Generate and visualize
plan = FloorPlan(width=100, height=50)
plan.generate_layout()
plan.visualize()

print(f"Total desks: {len(plan.desks)}")
print(f"Meeting rooms: {len(plan.meeting_rooms)}")
```

This is a basic greedy algorithm - it places rooms and desks in order, rejecting placements that violate constraints. It's fast and produces reasonable layouts.

## A Better Approach: Genetic Algorithm

For more complex optimization, use a genetic algorithm. Each "organism" is a complete floor plan. We mutate them (move desks, add/remove rooms) and keep the fittest (most desks, best walkway efficiency).

```python
import random

class FloorPlanGA:
    def __init__(self, width, height, population_size=50, generations=100):
        self.width = width
        self.height = height
        self.population_size = population_size
        self.generations = generations

    def random_plan(self):
        """Generate a random floor plan."""
        plan = FloorPlan(self.width, self.height)

        # Randomly place 3-5 meeting rooms
        for _ in range(random.randint(3, 5)):
            x = random.uniform(0, self.width - 3)
            y = random.uniform(0, self.height - 4)
            plan.add_meeting_room(x, y)

        # Randomly place desks
        for _ in range(random.randint(20, 40)):
            x = random.uniform(0, self.width - 1)
            y = random.uniform(0, self.height - 1)
            plan.add_desk(x, y)

        return plan

    def fitness(self, plan):
        """Fitness: maximize desks, minimize wasted space."""
        # Simple fitness: number of desks (more is better)
        return len(plan.desks)

    def mutate(self, plan):
        """Mutate a plan by adding/removing desks."""
        new_plan = FloorPlan(plan.width, plan.height)
        new_plan.desks = plan.desks.copy()
        new_plan.meeting_rooms = plan.meeting_rooms.copy()

        # 50% chance to add a desk, 50% to remove
        if random.random() < 0.5:
            x = random.uniform(0, self.width - 1)
            y = random.uniform(0, self.height - 1)
            new_plan.add_desk(x, y)
        elif new_plan.desks:
            new_plan.desks.pop()

        return new_plan

    def run(self):
        """Run the genetic algorithm."""
        population = [self.random_plan() for _ in range(self.population_size)]

        for gen in range(self.generations):
            # Evaluate fitness
            fitness_scores = [(plan, self.fitness(plan)) for plan in population]
            fitness_scores.sort(key=lambda x: x[1], reverse=True)

            print(f"Generation {gen}: best fitness = {fitness_scores[0][1]} desks")

            # Keep top 50%
            best_half = [plan for plan, _ in fitness_scores[:self.population_size // 2]]

            # Generate offspring via mutation
            offspring = [self.mutate(random.choice(best_half)) for _ in range(self.population_size // 2)]

            population = best_half + offspring

        # Return the best plan
        best_plan = max(population, key=self.fitness)
        return best_plan

# Run the GA
ga = FloorPlanGA(width=100, height=50, population_size=50, generations=50)
best = ga.run()
best.visualize()
```

This is more sophisticated. The population improves over generations, and you get genuinely optimized layouts.

## Real-World Applications

This approach scales to real problems:

**Urban planning**: Generate road networks that minimize total road length while ensuring all areas are connected. Constraints: slopes, water bodies, existing infrastructure.

**Warehouse layout**: Place storage bins and aisles to minimize pick-and-place distance. Constraints: bin types, aisle width, loading/unloading zones.

**Data center racks**: Arrange server racks and cooling units to maximize space efficiency and minimize cable runs.

**Retail floor plans**: Place product shelves and checkout counters to maximize floor coverage and minimize wasted space.

## The Reality Check

Generative design is powerful but has real limits:

- **It doesn't understand aesthetics**: A genetically optimized floor plan might be spatially efficient but ugly or impractical to navigate.
- **It needs good constraints**: Garbage in, garbage out. If your constraints don't capture what matters, the algorithm optimizes for nonsense.
- **It's not real design**: It's a tool, not a replacement for human judgment. Use it to explore possibilities, not to auto-generate designs.
- **Computational cost**: Complex problems (thousands of objects, many constraints) slow down fast. A GA can take hours for a real-world problem.

## The Honest Take

Generative spatial design works best as an exploratory tool. Generate 100 floor plan variations, show them to stakeholders, let them pick the best one and tweak it by hand. It's not about replacing architects or planners - it's about expanding the space of possibilities they consider.

For small-scale problems (offices, retail), a genetic algorithm in Python is practical. For large-scale problems (cities, industrial parks), you need specialized tools like Grasshopper (in Rhino) or dedicated optimization packages.

The code above is a foundation. From here, you add real constraints (structure loading, fire codes, accessibility), better fitness functions (walkability, natural light), and visualization. It's a rabbit hole - fun and productive, but endless.
