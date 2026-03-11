Title: The Mountain Car Problem: Why DQN Fails and How Reward Shaping Fixes It
Date: 2026-03-12
Author: Jack McKew
Category: Python
Tags: reinforcement-learning, dqn, reward-shaping, mountain-car, deep-learning

Mountain Car is one of the simplest RL benchmarks: a car in a valley needs to reach a flag at the top of a hill. Two actions: push left, push right. The car isn't powerful enough to drive straight up - it needs to swing back and forth to build momentum.

DQN should handle this easily. And yet the sparse agent's training curve looks like this:

```
Ep  100: success= 0%  (timing out every episode)
Ep  300: success=52%  (found the strategy!)
Ep  500: success= 0%  (forgot it completely)
Ep  700: success=98%  (found it again!)
Ep  800: success= 0%  (lost it again)
```

This violent oscillation - not a clean failure, not a clean success - is the actual face of sparse reward training. And the fix - reward shaping - reveals something fundamental about why it happens.

## The Environment

State (2-dim):
- Position: -1.2 (left wall) to 0.6 (goal)
- Velocity: -0.07 to +0.07

Actions: 0 = push left, 1 = no push, 2 = push right

Physics: the car's acceleration includes a gravity term based on the slope, so it naturally rolls back toward the centre of the valley.

Episode terminates when position >= 0.45 (goal) or after 200 steps.

## Why Sparse Reward Is Unstable

The sparse reward: **-1 per step until reaching the goal, 0 at the goal.** This looks reasonable - it penalises slow play and rewards reaching the flag.

The problem is two-fold.

**First**: with random exploration, a car starting at position -0.5 almost never reaches position 0.45 in 200 steps. The car needs to swing back and forth to build momentum - random pushes cancel out. In 3,000 episodes, a random agent might reach the goal 2-5 times by accident. Q-values are estimated from almost no successful data.

**Second, and more important**: when the agent *does* find the goal policy, it can't hold onto it.

Here's what happens at episode 700 (success rate 98%): the replay buffer is full of successful trajectories. Q-values correctly estimate that pushing in the direction of motion leads to high-energy states that eventually reach the goal. The policy is excellent.

Then at episode 800 (success rate 0%): the replay buffer has been partially overwritten with new episodes. The new Q-values, trained on a mix of old successes and new failures, diverge. The target network update (every N steps) propagates these bad estimates back. The policy collapses.

This is **catastrophic forgetting** - not a failure to learn, but a failure to *retain* learning. The sparse agent learns the right strategy multiple times and forgets it multiple times. It's stuck in a loop where it can occasionally discover the solution but can never stabilise around it.

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

| Episode | Sparse Success % | Shaped Success % |
|---------|-----------------|-----------------|
| 100 | 0% | (training) |
| 300 | 52% | ~75% |
| 500 | 0% | ~90% |
| 700 | 98% | ~95% |
| 800 | 0% | ~95% |
| 3,000 | oscillating | stable 90%+ |

**Shaped DQN:** reaches high success by episode 300-500 and stays there. No oscillation. Once it finds the momentum-building strategy, the dense shaping reward keeps that strategy reinforced on every episode, preventing the forgetting loop.

**Sparse DQN:** oscillates violently. It genuinely finds the solution multiple times (52%, 98%) but can't maintain it. The net success rate averaged across 3,000 episodes is much lower than the peaks suggest.

The shaped agent doesn't just succeed more - it finds a *stable* policy. The shaped reward teaches momentum-building as an intermediate goal on every episode, so the replay buffer always contains useful signal. The sparse agent's replay buffer alternates between "good strategy" episodes and "timeout" episodes, diluting the Q-value estimates each cycle.

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

Mountain Car demonstrates something more subtle than "sparse reward = failure."

The sparse DQN *can* solve Mountain Car. It discovers the momentum-building strategy multiple times, reaching 98% success rates. The problem is it can't hold onto the knowledge - the sparse signal creates a feedback loop where successful episodes get diluted by failures, Q-values drift, and the policy collapses.

Reward shaping fixes this by ensuring every episode - successful or not - provides useful gradient signal. The energy-based reward means even a "failed" episode (car doesn't reach the top) still updates Q-values in the right direction based on how much energy the car built up.

**The algorithm doesn't change. The replay buffer contents do.** With shaped reward, the buffer always contains informative trajectories. With sparse reward, most buffer entries are low-quality timeout episodes that overwhelm the occasional successful ones.

This is why reward function design often matters more than algorithm choice. Fix the signal quality first, then worry about the algorithm.

![Training curves: sparse vs shaped DQN comparison]({static}images/training_curves.png)
