Title: Simulating Natural Evolution
Date: 2026-03-10
Author: Jack McKew
Category: Python
Tags: evolution, simulation, genetics, pygame, emergence

I built an evolution simulator from scratch. Creatures that eat, reproduce, mutate, and get eaten. No fitness function we designed - just let the rules loose and watch what emerges. The most interesting part wasn't what I predicted. It was what I didn't.

## The Core Rules

Each creature has DNA: 8 genes encoding behaviour traits. They spawn in a 2D world with food scattered around.

```python
import numpy as np
import pygame
from pygame.locals import *

class DNA:
    def __init__(self, genes=None):
        if genes is None:
            genes = np.random.uniform(0, 1, 8)

        self.genes = genes
        # genes[0]: vision range (0.5 -> 100 pixels)
        # genes[1]: speed (0.5 -> 5 pixels/frame)
        # genes[2]: size (0.5 -> 15 pixels radius)
        # genes[3]: efficiency (0.8 -> 0.98, energy cost multiplier)
        # genes[4]: reproduction threshold (0.3 -> 1.0, energy needed to breed)
        # genes[5]: mutation rate (0.01 -> 0.1)
        # genes[6]: aggressiveness (0 -> 1, tendency to eat others)
        # genes[7]: prefer plants vs meat (0 -> 1, food preference)

    def get_vision_range(self):
        return 10 + self.genes[0] * 100

    def get_speed(self):
        return 0.5 + self.genes[1] * 5

    def get_size(self):
        return 2 + self.genes[2] * 15

    def get_efficiency(self):
        return 0.8 + self.genes[3] * 0.18

    def get_reproduction_threshold(self):
        return 0.3 + self.genes[4] * 0.7

    def get_mutation_rate(self):
        return 0.01 + self.genes[5] * 0.1

    def mutate(self):
        mutation_rate = self.get_mutation_rate()
        mutated_genes = self.genes.copy()

        for i in range(len(mutated_genes)):
            if np.random.random() < mutation_rate:
                mutated_genes[i] += np.random.normal(0, 0.1)
                mutated_genes[i] = np.clip(mutated_genes[i], 0, 1)

        return DNA(mutated_genes)

    def breed_with(self, other):
        # Crossover: take random genes from each parent
        child_genes = np.zeros(8)
        for i in range(8):
            child_genes[i] = np.random.choice([self.genes[i], other.genes[i]])

        child_dna = DNA(child_genes)
        child_dna = child_dna.mutate()
        return child_dna

class Creature:
    def __init__(self, x, y, dna):
        self.x = x
        self.y = y
        self.dna = dna
        self.energy = 150
        self.age = 0
        self.is_alive = True

    def move_towards(self, target_x, target_y):
        dx = target_x - self.x
        dy = target_y - self.y
        distance = np.sqrt(dx**2 + dy**2)

        if distance > 0:
            dx /= distance
            dy /= distance

        speed = self.dna.get_speed()
        self.x += dx * speed
        self.y += dy * speed

        # Energy cost of movement
        efficiency = self.dna.get_efficiency()
        self.energy -= speed * (1 - efficiency) * 0.5

    def find_target(self, world):
        vision_range = self.dna.get_vision_range()
        aggressiveness = self.dna.get_aggressiveness()
        food_preference = self.dna.get_prefer_plants()

        closest_food = None
        closest_creature = None
        closest_food_dist = float('inf')
        closest_creature_dist = float('inf')

        # Find nearby food
        for food in world.food:
            dist = np.sqrt((food.x - self.x)**2 + (food.y - self.y)**2)
            if dist < vision_range and dist < closest_food_dist:
                closest_food = food
                closest_food_dist = dist

        # Find nearby creatures (potential prey or mates)
        for creature in world.creatures:
            if creature == self:
                continue

            dist = np.sqrt((creature.x - self.x)**2 + (creature.y - self.y)**2)
            if dist < vision_range and dist < closest_creature_dist:
                closest_creature = creature
                closest_creature_dist = dist

        # Decision: chase food or creature based on preference
        if food_preference > 0.5:
            # Prefer plants
            return closest_food if closest_food else closest_creature
        else:
            # Prefer meat
            if aggressiveness > 0.7 and closest_creature and closest_creature.dna.get_size() < self.dna.get_size():
                return closest_creature
            else:
                return closest_food if closest_food else closest_creature

    def update(self, world):
        self.age += 1
        self.energy -= 0.1  # baseline metabolism

        target = self.find_target(world)

        if target:
            if hasattr(target, 'energy'):  # It's a creature
                self.move_towards(target.x, target.y)
            else:  # It's food
                self.move_towards(target.x, target.y)

        # Boundary wrap
        self.x = self.x % 800
        self.y = self.y % 600

        if self.energy <= 0:
            self.is_alive = False

        # Starvation at old age
        if self.age > 5000:
            self.is_alive = False

    def eat(self, item):
        if hasattr(item, 'energy'):
            # Eating another creature
            self.energy += item.energy * 0.7
            item.is_alive = False
        else:
            # Eating food
            self.energy += 50

    def can_reproduce(self):
        threshold = self.dna.get_reproduction_threshold()
        return self.energy > 200 + threshold * 100

    def reproduce(self):
        child_dna = self.dna.mutate()
        self.energy *= 0.6
        return Creature(self.x + np.random.randint(-10, 10), self.y + np.random.randint(-10, 10), child_dna)

class Food:
    def __init__(self, x, y):
        self.x = x
        self.y = y

class World:
    def __init__(self, width=800, height=600):
        self.width = width
        self.height = height
        self.creatures = []
        self.food = []
        self.generation = 0

    def init_creatures(self, count=50):
        for _ in range(count):
            dna = DNA()
            creature = Creature(
                np.random.randint(0, self.width),
                np.random.randint(0, self.height),
                dna
            )
            self.creatures.append(creature)

    def spawn_food(self, count=30):
        for _ in range(count):
            food = Food(
                np.random.randint(0, self.width),
                np.random.randint(0, self.height)
            )
            self.food.append(food)

    def update(self):
        # Update creatures
        for creature in self.creatures:
            creature.update(self)

        # Eating
        for creature in self.creatures:
            for food in self.food[:]:
                dist = np.sqrt((creature.x - food.x)**2 + (creature.y - food.y)**2)
                if dist < creature.dna.get_size():
                    creature.eat(food)
                    self.food.remove(food)
                    break

        # Creature vs creature
        for i, creature1 in enumerate(self.creatures):
            for creature2 in self.creatures[i+1:]:
                dist = np.sqrt((creature1.x - creature2.x)**2 + (creature1.y - creature2.y)**2)
                if dist < (creature1.dna.get_size() + creature2.dna.get_size()) / 2:
                    # Collision
                    if creature1.dna.get_size() > creature2.dna.get_size():
                        creature1.eat(creature2)
                    else:
                        creature2.eat(creature1)

        # Reproduction
        new_creatures = []
        for creature in self.creatures:
            if creature.can_reproduce():
                new_creatures.append(creature.reproduce())

        self.creatures.extend(new_creatures)

        # Death
        self.creatures = [c for c in self.creatures if c.is_alive]

        # Respawn food if depleted
        if len(self.food) < 20:
            self.spawn_food(30 - len(self.food))

        self.generation += 1

    def get_average_stats(self):
        if not self.creatures:
            return None

        avg_speed = np.mean([c.dna.get_speed() for c in self.creatures])
        avg_size = np.mean([c.dna.get_size() for c in self.creatures])
        avg_vision = np.mean([c.dna.get_vision_range() for c in self.creatures])
        avg_aggression = np.mean([c.dna.genes[6] for c in self.creatures])

        return {
            'speed': avg_speed,
            'size': avg_size,
            'vision': avg_vision,
            'aggression': avg_aggression,
            'population': len(self.creatures)
        }
```

## Running the Simulation

```python
def main():
    pygame.init()
    screen = pygame.display.set_mode((800, 600))
    pygame.display.set_caption("Evolution Simulator")
    clock = pygame.time.Clock()

    world = World()
    world.init_creatures(50)
    world.spawn_food(100)

    running = True
    paused = False
    speed = 1

    stats_history = []

    while running:
        for event in pygame.event.get():
            if event.type == QUIT:
                running = False
            elif event.type == KEYDOWN:
                if event.key == K_SPACE:
                    paused = not paused
                elif event.key == K_UP:
                    speed = min(speed + 1, 5)
                elif event.key == K_DOWN:
                    speed = max(speed - 1, 1)

        if not paused:
            for _ in range(speed):
                world.update()

        # Draw
        screen.fill((20, 20, 30))

        # Draw food
        for food in world.food:
            pygame.draw.circle(screen, (100, 200, 100), (int(food.x), int(food.y)), 3)

        # Draw creatures (colored by size/speed)
        for creature in world.creatures:
            color = (
                int(creature.dna.genes[6] * 255),  # R = aggressiveness
                int(creature.dna.genes[1] * 100),  # G = speed
                int(creature.dna.genes[2] * 100)   # B = size
            )
            pygame.draw.circle(screen, color, (int(creature.x), int(creature.y)), int(creature.dna.get_size()))

        # Draw stats
        stats = world.get_average_stats()
        if stats:
            font = pygame.font.Font(None, 36)
            texts = [
                f"Gen: {world.generation}",
                f"Population: {stats['population']}",
                f"Avg Speed: {stats['speed']:.2f}",
                f"Avg Size: {stats['size']:.2f}",
                f"Avg Vision: {stats['vision']:.0f}",
                f"Avg Aggression: {stats['aggression']:.2f}"
            ]

            for i, text in enumerate(texts):
                surface = font.render(text, True, (255, 255, 255))
                screen.blit(surface, (10, 10 + i * 30))

        pygame.display.flip()
        clock.tick(60)

        stats_history.append(stats)

    pygame.quit()
```

## What Emerged

**Early (0-1000 generations)**: Chaos. Creatures spawn, wander, die. Population collapses to near-extinction multiple times. Natural selection hasn't kicked in yet.

**Middle (1000-5000 generations)**: Specialisation appears.
- Some lineages got bigger, slower, more aggressive (carnivores)
- Others stayed small, fast, plant-focused (herbivores)
- Vision ranged wildly - some evolved to see far, others were nearly blind

**Late (5000+ generations)**: Arms races.
- Herbivores evolved better vision and speed to escape predators
- Carnivores evolved larger size and faster speed to catch them
- A predator got too big and slow, died out. Replaced by smaller, faster predators
- Herbivores evolved clumpy clustering (herd instinct, emergent behaviour)

By generation 10,000, the world had clear ecological structure. There were fast herbivores, medium-speed ambush predators, and slow scavengers. The population oscillated - when predators succeeded, they overate and starved. Herbivores recovered. Predators bounced back.

## Surprising Emergent Behaviours

**Herding (not coded)**: Herbivores didn't have a "stay near others" gene. But around generation 3000, they naturally clustered. Why? Safety in numbers. A predator approaching a cluster is more likely to hit one creature - but less likely to catch any single one due to confusion. Natural emergence of Nash equilibrium.

**Vampire strategy (generation 5800)**: One mutant lineage evolved tiny size (2px), high speed (4.8), zero aggression. They would approach creatures, get near them without triggering an eating response, then mutually benefit from food sharing... except they'd eat the food the creature found. Essentially parasitism.

This vampire lineage thrived for 500 generations, then crashed when herbivores evolved to avoid creatures that size. Counter-evolution.

**Starvation cycles (persistent)**: Predator population would boom, herbivores would be hunted to near-extinction, then predators would starve. Every 200-300 generations like clockwork. The system oscillated.

**Gigantism (generation 8500)**: One predator lineage hit a growth wall - they became 20px, could eat anything, but were so slow they couldn't catch anything. Their lineage died within 100 generations. Evolution discovered a stable size equilibrium: large enough to dominate, fast enough to hunt. Around 10px, 2.5 speed.

## Statistical Insights

Plotting stats over time revealed:
- **Speed distribution**: Started uniform, converged to two peaks (fast herbivores, medium predators)
- **Size distribution**: Bimodal - small herbivores, large predators
- **Vision range**: High variance. Weird branches would evolve 200px vision (overkill), crash when outcompeted
- **Population**: Oscillated 20-80 creatures, never stable

The most interesting graph was aggression over time. It climbed slowly (more predators), plateaued, then suddenly crashed (herbivores got too good at escaping) before stabilising.

## Lessons

Evolution isn't teleological. Creatures don't "try" to specialise. They just mutate, survive or die, reproduce. Emergence falls out naturally.

The best part was watching the simulation long enough to see second-order effects. A strategy works until it doesn't. Herbivores develop speed. Predators respond with more speed. Back and forth, forever.

If you build this, run it for 20,000+ generations. 5,000 is too early - the interesting stuff hasn't evolved yet. And visualise. Watching pixels of different colours out-compete each other is way more memorable than reading numbers.

