Title: I Tried to Teach an AI to Land a Rocket. Here's What Actually Happened.
Date: 2026-03-12
Author: Jack McKew
Category: Python
Tags: reinforcement-learning, dqn, rocket-landing, deep-learning, reward-engineering

CartPole solved in 10 generations. Tic-Tac-Toe achieved perfect play. So I built a 2D rocket lander and expected DQN to crack it in an afternoon.

It didn't.

This is the story of what happened instead, and what it reveals about the gap between "simple-looking" control problems and what RL actually finds hard.

## After 8,000 Episodes

| Episode | Reward | Land % | Crash % |
|---------|--------|--------|---------|
| 200 | -80.9 | 0% | 29.5% |
| 400 | -79.8 | 0% | 0% |
| 800 | -50.9 | 0% | 0% |
| 1,000 | -61.7 | 0% | 50% |
| 1,400 | -83.2 | 0% | 68% |
| 2,000 | -68.6 | 0% | 5.5% |
| 2,200 | -51.3 | 0% | 0% |

Landing rate: 0%. But that oscillation between 0% and 68% crash rates isn't noise - it's the agent repeatedly discovering the right direction, failing to execute, and retreating to a safer policy.

<video autoplay loop muted playsinline width="100%"><source src="{static}images/ai-learns-rocket-landing.mp4" type="video/mp4"></video>

Here's what that pattern reveals about sparse-reward control.

## The Environment

A 2D rocket starts in the upper half of the world. It has:
- Main thruster (pointing down, fires upward)
- Two rotation thrusters (rotate left/right)
- Gravity pulling it down
- A landing pad at the centre of the bottom

The state is 8-dimensional:

```
x / W             - horizontal position (normalised)
y / H             - vertical position
vx / 30           - horizontal velocity
vy / 30           - vertical velocity
angle / pi        - rotation angle
angular_vel / 5   - angular velocity
leg_left          - 1 if left leg touching ground
leg_right         - 1 if right leg touching ground
```

Actions: 0 = nothing, 1 = main thrust, 2 = rotate left, 3 = rotate right.

Landing success requires: |vx| < 2.5, |vy| < 2.5, |angle| < 0.25 rad, position over the pad.

**Reward:**
- Soft landing: +100 to +175 (based on how precisely centred)
- Crash: -100
- Out of bounds: -50
- Step penalty: small negative scaled by distance from pad (encourages efficiency)

The network: 8 inputs, 256 hidden, 256 hidden, 4 outputs.

## Training: 8,000 Episodes

| Episode | Reward | Land % | Crash % |
|---------|--------|--------|---------|
| 200 | -80.9 | 0% | 29.5% |
| 400 | -79.8 | 0% | 0% |
| 800 | -50.9 | 0% | 0% |
| 1000 | -61.7 | 0% | 50% |
| 1400 | -83.2 | 0% | 68% |
| 2000 | -68.6 | 0% | 5.5% |
| 2200 | -51.3 | 0% | 0% |

That oscillation between ep 800 and 2200 is not noise. It's a pattern.

## The Oscillation Problem

At ep 400-800, the agent learned something useful: stay in-bounds long enough to accumulate step rewards. Reward around -50 means it survived many steps without crashing.

Then at ep 1000-1400, the crash rate jumped to 68%. What happened? The agent started learning a more aggressive policy - moving the rocket toward the pad rather than just hovering. But it hadn't yet learned to control the landing, so it crashed repeatedly.

By ep 2000-2200, the crash rate dropped back to near-zero, and reward recovered to -51. The agent reverted to the "safe but non-landing" strategy.

This is the **exploration-exploitation oscillation** of DQN on sparse-reward problems:

1. Agent discovers a stable hovering policy (safe, mediocre reward)
2. Exploration discovers that moving toward the pad gets more reward
3. Agent switches to aggressive descent - crashes repeatedly
4. Target network updates destabilise Q-values
5. Agent retreats back to the safe hovering policy

**The fundamental issue**: landing requires a precise sequence of actions (thrust to slow descent, rotate to vertical, cut thrust at the right moment). Random exploration almost never executes this sequence correctly. The landing reward (+100) is so far from the agent's current experience that the Q-values for landing actions remain poorly estimated.

## Why This Is Harder Than CartPole

CartPole and rocket landing look superficially similar - both involve balancing physics. But:

**CartPole:**
- 4-dimensional state
- Binary action (push left or right)
- Dense reward: +1 every step you're still alive
- Optimal policy is simple: "lean right, push right"
- A random population finds this accidentally (as the genetic algorithm showed)

**Rocket Lander:**
- 8-dimensional state including rotational dynamics
- 4 actions with complex interactions (thrust + rotation coupling)
- Sparse terminal reward: landing bonus only comes at episode end
- Optimal policy requires multi-step coordination: approach, slow down, orient, cut thrust
- **No random walk discovers a landing** - the probability is effectively zero

For CartPole, any policy that responds to the pole angle at all does reasonably well. For rocket landing, you need to get a dozen steps exactly right in sequence.

## The Reward Shaping Problem

The reward function I used seemed reasonable:
- Step penalty proportional to pad distance (encourages moving toward pad)
- Landing bonus +100-175
- Crash penalty -100

But there's a subtle problem: the step penalty for distance creates a gradient that says "get closer to the pad" but doesn't say anything about *how* to get there safely. An agent maximising step reward can move toward the pad quickly (minimising distance) while building up too much velocity to land safely.

Proper reward shaping for landing needs:
- Separate velocity penalty: penalise |vx|, |vy| independently
- Angle penalty: penalise deviation from vertical near the ground
- Smooth shaping that guides approach, deceleration, and orientation simultaneously

The version I built was too sparse in the terminal reward and too blunt in the step reward. The agent learned to avoid crashing (good) but never learned the full landing sequence.

## What Would Actually Work

**More training**: 8,000 episodes is often not enough for sparse-reward control. OpenAI's LunarLander-v2 (similar complexity) typically takes 300-500K steps to solve with well-tuned DQN. Each episode is ~400 steps, so 8,000 episodes = ~3.2M steps. Getting there.

**Better reward shaping**:
```python
reward += -0.3 * abs(vx)         # penalise horizontal velocity
reward += -0.3 * abs(vy + 1.0)   # penalise high descent rate
reward += -0.5 * abs(angle)      # penalise tilt
reward += -0.1 * (pad_dist)      # gentle pad approach bonus
```

**PPO instead of DQN**: Proximal Policy Optimisation handles the gradient instability better on continuous control. PPO with a shaped reward would likely converge in 50K-100K steps.

**Curriculum learning**: Start with the rocket close to the pad (easy landing), then progressively increase the starting height and velocity. This ensures the agent gets landing experience early.

## The Actual Lesson

The lander didn't fail because the code was wrong. It failed because 8,000 episodes of DQN with a sparse terminal reward is genuinely insufficient for this problem class.

The interesting part isn't the failure - it's *why* it failed. The oscillating crash rate tells you exactly what's happening inside the network: the agent keeps discovering that moving toward the pad is directionally correct, then failing to execute the precision landing, then retreating.

**This is how RL actually works on hard problems.** You don't get a smooth learning curve. You get a system that oscillates between different failure modes while slowly improving the parts of the policy it can learn from the reward signal available.

CartPole with genetic algorithms looks clean because the problem is actually easy. Rocket landing isn't easy. The failure mode here is honest.

Next step: PPO with proper reward shaping. That's a different post.

![Training curves and crash rate oscillation]({static}images/training_curves.png)
