Title: The Mountain Car Problem: Why DQN Fails and How Reward Shaping Fixes It
Date: 2026-03-12
Author: Jack McKew
Category: Python
Tags: reinforcement-learning, dqn, reward-shaping, mountain-car, deep-learning

Mountain Car is one of the simplest RL benchmarks: a car in a valley needs to reach a flag at the top of a hill. Two actions: push left, push right. The car isn't powerful enough to drive straight up - it needs to swing back and forth to build momentum.

DQN should handle this easily. And yet:

**Sparse DQN: 0-5% success rate after 3,000 episodes.**

The reason is one of the most important concepts in RL: **reward sparsity**. And the fix - reward shaping - reveals something fundamental about how learning actually works.

## The Environment

State (2-dim):
- Position: -1.2 (left wall) to 0.6 (goal)
- Velocity: -0.07 to +0.07

Actions: 0 = push left, 1 = no push, 2 = push right

Physics: the car's acceleration includes a gravity term based on the slope, so it naturally rolls back toward the centre of the valley.

Episode terminates when position >= 0.45 (goal) or after 200 steps.

## Why Sparse Reward Fails

The sparse reward: **-1 per step until reaching the goal, 0 at the goal.** This looks reasonable. It penalises taking too long and rewards reaching the goal.

The problem: **with random exploration, a car starting at position -0.5 almost never reaches position 0.45 in 200 steps.**

Here's the physics: the car starts near the bottom. To reach the goal, it needs to swing repeatedly back and forth, gaining momentum each pass. A random policy doesn't do this - it pushes randomly, which averages out to near-zero net force. The car bounces around the bottom of the valley and times out.

**In 3,000 training episodes, a random agent might reach the goal 2-5 times by accident.** That's 5 successful experiences out of 600,000 steps. Q-values for the "push in the right direction" actions are estimated from almost no data.

DQN can't learn what it can't observe.

## Reward Shaping: The Energy Trick

The fix: add a potential-based shaping term that guides the agent even when it hasn't reached the goal.

The key insight: total mechanical energy in the system. Height is hard to compute, but we can use the mountain's shape:

```python
height = np.sin(3 * position) + 1.0   # normalised to [0, 2]
phi_next = height + 0.5 * (velocity / MAX_VEL) ** 2

reward += 1.5 * phi_next   # shaping bonus
```

This gives the agent positive reward whenever it has:
1. High position (moved up the mountain)
2. High velocity (built up kinetic energy)

**The momentum-building strategy that reaches the goal produces consistently higher shaped rewards** - even on the attempts that don't quite make it. The agent now gets useful gradient signal from every episode.

## Results

| Agent | Success Rate | Avg Steps to Goal |
|-------|-------------|-------------------|
| Sparse DQN | ~3% | 198 (barely makes it) |
| Shaped DQN | ~85%+ | ~140 |

**Shaped DQN:** starts succeeding by episode 300-500. By episode 2,000 it's consistently reaching the goal.

**Sparse DQN:** flat at ~0-5% for the entire 3,000 episodes. The few successes it has are essentially accidents.

The shaped agent doesn't just succeed more - it finds a better strategy. The shaped reward teaches momentum-building as an intermediate goal, so the agent executes clean left-right swings before pushing up the hill. The sparse agent (if it ever succeeds) tends to thrash randomly until it stumbles into the goal.

## The Shaping Looks Like Cheating - Is It?

Not exactly. Potential-based reward shaping has a formal property: **it doesn't change the optimal policy**.

A potential function F(s) adds reward F(s') - F(s) at each transition. If F is a true potential (no cycles), then the optimal policy under the shaped reward is the same as under the sparse reward. You're adding a "direction to the goal" signal without actually changing what the goal is.

The energy function used here isn't a perfect potential, but it's close enough: the optimal path up the mountain genuinely is the high-energy path. We're giving the agent physics intuition it would otherwise have to discover by accident.

Compare this to bad shaping:
- "Reward for moving right" - will make the agent drive right even if it should swing left first
- "Reward for high speed" - will make the agent drive fast into the left wall
- "Reward for low step count" - might make the agent find a different goal (like dying quickly)

The energy shaping works because it encodes correct physics, not just a heuristic about direction.

## When Reward Shaping Matters

Mountain Car is the textbook example because the sparsity is especially brutal: 200 steps, rare goal. But the same issue appears in any problem with:

| Domain | Sparse reward source |
|--------|---------------------|
| Robot locomotion | Only reward at target position |
| Game playing (Montezuma's Revenge) | Very rare collectibles |
| Molecular design | Only feedback after full synthesis |
| Dialogue agents | Only reward at conversation end |
| Robotic assembly | Only reward when object is assembled |

In all these cases, the DQN (or PPO, or any RL algorithm) sees near-zero reward for thousands of steps. Q-values for useful intermediate actions never get estimated correctly.

The field's responses:

**Reward shaping** (this post): manually encode domain knowledge as a potential function. Works well when you understand the problem physics.

**Intrinsic motivation / curiosity**: reward the agent for visiting novel states. No domain knowledge required, but can get distracted by irrelevant novelty.

**Hindsight Experience Replay (HER)**: relabel failed trajectories as if a different goal was achieved. Very effective for robotics.

**Curriculum learning**: start with easy versions where success is more likely, progressively increase difficulty.

## The Code

```python
def step(self, action, shaped=False):
    # ... physics ...
    reward = 0.0 if self.pos >= GOAL_POS else -1.0

    if shaped:
        height = np.sin(3 * self.pos) + 1.0
        phi_next = height + 0.5 * (self.vel / MAX_VEL) ** 2
        reward += 1.5 * phi_next

    return self._state(), reward, done
```

The shaped agent and sparse agent use identical DQN architectures (`2 -> 64 -> 64 -> 3`). The only difference is this 3-line shaping bonus.

85%+ success rate vs 3% success rate. From 3 lines of physics.

## What Sparse DQN Is Actually Learning

Here's the non-obvious part: sparse DQN isn't completely failing. Its Q-values do converge to something:

- Q(push-right | moving right, near bottom) ≈ -150
- Q(push-left | moving left, near bottom) ≈ -150

It's learning that all actions in the valley are about equally bad (you'll time out regardless). This is technically correct for the sparse problem - if you're in the valley, you *are* likely to time out with random exploration. The Q-values just never saw enough successful trajectories to learn the momentum-building strategy.

The shaped agent's Q-values tell a different story:
- Q(push-right | moving right, near bottom) >> Q(push-left | same state)
- Q(push-left | moving left, near bottom) >> Q(push-right | same state)

It learned: **align your push with your momentum**. That's the right physics. The shaped reward created the signal that made this learnable.

## The Takeaway

Mountain Car is a perfect example of why reward function design is often more important than algorithm choice.

Switch from DQN to PPO with sparse reward: still fails. Switch from DQN to DQN with shaped reward: 85%+ success.

The algorithm doesn't matter if the agent can't learn from the signal. Reward shaping - done correctly - encodes the domain knowledge that makes learning tractable.

![Training curves: sparse vs shaped DQN comparison]({static}images/training_curves.png)
