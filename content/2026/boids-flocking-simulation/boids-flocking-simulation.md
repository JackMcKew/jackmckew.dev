Title: Simulating Flocking Behaviour with Boids
Date: 2026-03-11
Author: Jack McKew
Category: Python
Tags: python, simulation, boids, pygame, emergent-behaviour

I've always been fascinated by murmuration - that hypnotic dance thousands of starlings do at dusk, moving like a single organism. Last month I implemented Craig Reynolds' boids algorithm and realized I could generate something that looks genuinely like murmuration with just three arithmetic operations per bird.

Here's the magic: three simple rules applied to each boid independently produce complex, emergent flocking behaviour.

## The Three Rules

**Separation** - steer to avoid crowding local flockmates.
**Alignment** - steer towards the average heading of local flockmates.
**Cohesion** - steer to move toward the average location of local flockmates.

That's it. No master choreographer. No global plan. Just each boid asking "what are my neighbours doing?" and adjusting accordingly.

## The Implementation

I'm using Pygame to visualize, NumPy to handle the math efficiently:

```python
import pygame
import numpy as np

class Boid:
    def __init__(self, x, y, max_speed=2.0):
        self.pos = np.array([x, y], dtype=float)
        self.vel = np.array([np.random.uniform(-1, 1), np.random.uniform(-1, 1)], dtype=float)
        self.acc = np.array([0.0, 0.0])
        self.max_speed = max_speed
        self.perception_radius = 50

    def separation(self, boids):
        # Steer away from nearby boids
        steer = np.array([0.0, 0.0])
        count = 0
        for other in boids:
            dist = np.linalg.norm(self.pos - other.pos)
            if 0 < dist < self.perception_radius:
                diff = self.pos - other.pos
                diff /= dist  # Normalize and weight by distance
                steer += diff
                count += 1
        if count > 0:
            steer /= count
        return steer

    def alignment(self, boids):
        # Steer towards average heading
        avg_heading = np.array([0.0, 0.0])
        count = 0
        for other in boids:
            dist = np.linalg.norm(self.pos - other.pos)
            if 0 < dist < self.perception_radius:
                avg_heading += other.vel
                count += 1
        if count > 0:
            avg_heading /= count
        return avg_heading

    def cohesion(self, boids):
        # Steer towards average position
        avg_pos = np.array([0.0, 0.0])
        count = 0
        for other in boids:
            dist = np.linalg.norm(self.pos - other.pos)
            if 0 < dist < self.perception_radius:
                avg_pos += other.pos
                count += 1
        if count > 0:
            avg_pos /= count
            return avg_pos - self.pos  # Steer towards it
        return np.array([0.0, 0.0])

    def update(self, boids, width, height):
        self.acc += self.separation(boids) * 1.5
        self.acc += self.alignment(boids) * 1.0
        self.acc += self.cohesion(boids) * 1.0

        self.vel += self.acc
        speed = np.linalg.norm(self.vel)
        if speed > self.max_speed:
            self.vel = (self.vel / speed) * self.max_speed

        self.pos += self.vel
        self.acc = np.array([0.0, 0.0])

        # Wrap around edges
        if self.pos[0] < 0:
            self.pos[0] = width
        elif self.pos[0] > width:
            self.pos[0] = 0
        if self.pos[1] < 0:
            self.pos[1] = height
        elif self.pos[1] > height:
            self.pos[1] = 0

    def draw(self, screen):
        pygame.draw.circle(screen, (255, 255, 255), self.pos.astype(int), 3)
```

The key insight: each boid only looks at neighbours within perception_radius. This keeps the simulation O(n^2) manageable and creates local cohesion that feels natural.

## Running It

```python
def main():
    pygame.init()
    width, height = 800, 600
    screen = pygame.display.set_mode((width, height))
    clock = pygame.time.Clock()

    boids = [Boid(np.random.uniform(0, width), np.random.uniform(0, height)) for _ in range(150)]

    running = True
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

        for boid in boids:
            boid.update(boids, width, height)

        screen.fill((0, 0, 0))
        for boid in boids:
            boid.draw(screen)

        pygame.display.flip()
        clock.tick(60)

    pygame.quit()

if __name__ == "__main__":
    main()
```

Run this and watch 150 boids self-organize into flocks that split, merge, and flow around obstacles. No instruction. No plan.

## The Emergent Bit That Blew Me Away

I added a predator - a fast-moving circle chasing the flock. What happened was unexpected: the boids didn't just flee randomly. They clustered tightly and moved as a unit, creating natural predator-evasion patterns you see in real bird flocks. The panic wasn't scripted. It emerged from the three rules reacting to a new threat.

That's when it clicked for me why this algorithm has stayed relevant for 30 years. Simple rules + local perception + time = complexity that looks alive.

## Tweaks Worth Trying

- Adjust weights (the multipliers on separation, alignment, cohesion) - 1.5, 1.0, 1.0 is a starting point
- Reduce perception_radius for tighter clusters, increase for looser formations
- Add obstacles as circles - boids will navigate around them automatically
- Vary max_speed per boid for more natural variation
- Add multiple predators or prey

The beauty of boids is how forgiving it is. You can tweak a number and suddenly the behaviour shifts in ways that feel intentional.
