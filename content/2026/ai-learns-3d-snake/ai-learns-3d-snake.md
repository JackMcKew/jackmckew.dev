Title: AI Learns to Play 3D Snake
Date: 2026-03-12
Author: Jack McKew
Category: Python
Tags: reinforcement-learning, snake, 3d, neural-networks, dqn

The classic 2D Snake game is already a decent RL benchmark - sparse rewards, self-collision, and a growing body that changes the game state. But 2D Snake is one problem. 3D Snake is a completely different challenge.

I trained a DQN agent on a 10x10x10 3D Snake environment for 3,000 episodes on a CPU. The results were honest: the agent learned one extremely important skill very quickly, then plateaued. Understanding *why* it plateaued tells you more about deep RL than a clean success story would.

## After 3,000 Episodes

| | Random (500 runs) | Trained DQN (500 runs) |
|---|---|---|
| Avg survival | 23.7 steps | **500.0 steps** (always hits limit) |
| Avg score (food eaten) | 0.030 | 0.064 |
| Episodes with food | 3.0% | 6.4% |

Perfect survival - it hits the 500-step time limit every single run without crashing into walls or itself. Food-finding is another story: roughly one piece of food every 15 episodes. Here's what happened and why.

## The Environment

10x10x10 grid. Six movement directions (+x, -x, +y, -y, +z, -z). Food spawns at random empty cells. Eating adds a body segment. Hitting a wall or yourself ends the episode.

The state is 15 dimensions:

```python
def _state(self):
    head = self.body[0]
    fd   = tuple(f - h for f, h in zip(self.food, head))

    # 6 danger sensors: is there a wall or body in each direction?
    danger = []
    for d in DIRS:
        nxt = tuple(h + dd for h, dd in zip(head, d))
        hit = not all(0 <= v < GRID for v in nxt) or nxt in self.body
        danger.append(float(hit))

    # Current direction (one-hot over 6 directions)
    dir_oh = [float(self.dir == d) for d in DIRS]

    # Normalised food delta (3 values)
    food_norm = [fd[0]/GRID, fd[1]/GRID, fd[2]/GRID]

    return np.array(danger + dir_oh + food_norm, dtype=np.float32)  # 15-dim
```

That's it - 6 collision sensors, 6 direction bits, 3 food bearings. No absolute position, no body map, no lookahead.

## The Network

Small DQN with two hidden layers:

```python
class DQN(nn.Module):
    def __init__(self, state_dim=15, n_actions=6):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(state_dim, 128),
            nn.ReLU(),
            nn.Linear(128, 128),
            nn.ReLU(),
            nn.Linear(128, n_actions),
        )
```

Experience replay buffer (10k), target network updated every 200 steps, epsilon decaying from 1.0 to 0.05 over 2,000 environment steps.

## What Actually Happened

After 3,000 training episodes on CPU:

**Random agent baseline (500 eval runs):**
- Average survival: 23.7 steps
- Average score (food eaten): 0.030
- Episodes where food was eaten: 3.0%

**Trained DQN (500 eval runs):**
- Average survival: **500.0 steps** (the episode time limit, every single run)
- Average score: 0.064
- Episodes where food was eaten: 6.4%

The agent learned to not die - completely. Going from 23 steps to hitting the 500-step ceiling every run is a real result. The random agent crashes into walls constantly. The trained agent navigates 3D space without self-collision or wall collision for the full episode length.

But it barely eats food. Average score of 0.064 means it eats roughly one piece of food every 15 episodes.

## Why Survival Came First

The reward structure made survival the easier thing to optimise:

- Death: -10 reward
- Eating food: +10 reward
- Each step alive: +0.05

Avoiding -10 is something the agent can learn from thousands of examples. Every time it dies, there's a strong negative signal pointing back at the action that caused it. With 6 binary danger sensors, the agent just needs to learn "if direction X has danger=1, don't go there." That's a learnable function.

Finding food is harder. The food delta (3 values) gives direction to food, but navigating there in 3D requires planning several moves ahead. The network has no memory, no lookahead, no map of the body. It can't see "if I go right now, I'll corner myself in 5 moves." Each decision is made from the current 15-dimensional snapshot.

## The Plateau Problem

Training score oscillated between 0.03 and 0.14 across all 3,000 episodes with no clear upward trend after episode 200. The epsilon dropped to 0.05 by step 2,000 (episode ~40), meaning the agent was already mostly greedy by the time most of the training happened.

That's a design flaw. The epsilon decay was calibrated for total environment steps, not for actual learning. Because 3D snake episodes are short on average (23 steps for a random agent), epsilon decayed to minimum while the agent had only seen a fraction of the state space.

Fixes that would help:
1. **Longer epsilon decay** - tie it to actual useful experience, not time steps
2. **Richer state** - include a local neighbourhood map around the head
3. **Curriculum learning** - start with a 5x5x5 grid, grow as performance improves
4. **Reward shaping** - add distance-to-food as a continuous signal

## 2D vs 3D: The State Space Problem

In 2D Snake, the agent needs to navigate on a plane. Good food direction + collision avoidance is often sufficient to reach food. In 3D, the optimal path may require going away from food on some axis to avoid blocking yourself on another.

The 10x10x10 grid has 1,000 possible head positions. A simple policy that goes toward food while avoiding immediate obstacles runs into more dead ends in 3D because there are more ways to trap yourself. A body segment can block you from all six directions simultaneously in 3D, something that's only possible in 2D at corners.

The key lesson isn't that 3D is too hard for RL - it's that this particular state representation (15-dim) doesn't give the agent enough information to plan in 3D. A convolutional network operating on a 3D grid neighbourhood would likely learn food-finding, but at much higher compute cost.

## What the Agent Did Learn

Despite the low food-eating rate, the trained agent shows clear intentional behaviour:

- **Systematic wall avoidance** - it smoothly turns before hitting boundaries rather than crashing in random directions
- **Direction consistency** - it doesn't flip-flop randomly; movements are deliberate
- **Space utilisation** - it explores the 3D space rather than circling in a corner

The survival skill alone is non-trivial. A naive agent that just turns away from immediate danger might still corner itself. This agent has implicitly learned something about longer-horizon self-avoidance.

![3D Snake training curve, baseline comparison, and survival distribution]({static}images/training_curves.png)
