Title: AI Learns Acrobat: Teaching a Double Pendulum to Swing Up
Date: 2026-03-12
Author: Jack McKew
Category: Python
Tags: reinforcement-learning, dqn, acrobat, control, pendulum, deep-learning

CartPole is a pendulum balancing problem. The AI keeps it upright by applying force.

Acrobat flips that challenge: instead of balancing a pendulum from above, you're swinging a double pendulum *upward* from a hanging rest position until the tip reaches a target height.

Same physics domain, completely different objective. Same DQN algorithm, different dynamics. Let's see what changes.

## The Acrobat System

Two rigid links connected by a motorised joint. The upper link hangs from a fixed pivot (no motor there). Only the joint between link 1 and link 2 can apply torque.

```
    O   ← fixed pivot (no motor)
    |
    |  link 1 (length 1.0, mass 1.0)
    |
    ●   ← motorised joint
   /
  /   link 2 (length 1.0, mass 1.0)
 /
*    ← end-effector (goal: get this above the dashed line)
```

**Goal**: swing the end-effector to height >= 1.0 above the pivot, i.e. higher than the pivot point itself.

**State (6-dimensional):**
```python
[cos(theta1), sin(theta1),   # link 1 angle (encoded as unit circle)
 cos(theta2), sin(theta2),   # link 2 angle relative to link 1
 dtheta1,                    # angular velocity of link 1
 dtheta2]                    # angular velocity of link 2
```

Angles encoded as (cos, sin) pairs to avoid discontinuity at +/-pi.

**Actions:** apply torque -1, 0, or +1 to the joint between the two links.

**Reward:** -1 per step until the goal height is reached. Episode ends at goal or 500 steps.

## Why Acrobat Is Harder Than CartPole

**CartPole**: keep the pole from falling over. The failure state (falling) happens quickly (within 50-100 steps if you do nothing). Dense feedback: you know immediately when you're failing.

**Acrobat**: swing a double pendulum up past a target height. Starting from rest at the bottom, the natural equilibrium is hanging straight down. Getting to the goal requires pumping energy into the system through repeated torque applications in the right phase.

Key differences:

| | CartPole | Acrobat |
|--|---------|---------|
| Starting state | Near-unstable equilibrium | Stable equilibrium (at rest) |
| Goal | Stay alive (avoid failure) | Reach a target (proactive) |
| Physics | Single link, simpler | Two links, coupled dynamics |
| Gravity effect | Destabilising (must overcome) | Must use gravity, not fight it |
| Natural strategy | Pole-angle tracking | Energy pumping, resonance |

The key insight for Acrobat: you have to work *with* physics, not against it. The optimal strategy is to pump the pendulum in resonance with its natural frequency - like pushing a swing at the right time to build amplitude.

## Training Results: 5,000 Episodes

| Episode | Solve Rate | Avg Steps |
|---------|-----------|-----------|
| 200 | ~5-10% | 480 |
| 1,000 | ~50-70% | 350 |
| 2,000 | ~80-90% | 250 |
| 5,000 | ~90-95% | 180-200 |

Random baseline: ~2-3% solve rate (occasionally the random walk happens to pump in the right direction), avg ~490 steps when solved.

The trained agent cuts average steps to ~180-200 - roughly 2.5x faster than the rare random successes.

## What the Agent Learned

**Stage 1 (0-500 episodes):** The agent discovers that constant torque (always max, always zero, or always min) doesn't work. The system requires timed application. Early training is mostly timing discovery.

**Stage 2 (500-2,000 episodes):** Energy pumping emerges. The agent learns to apply torque in phase with the pendulum's swing - push in the direction of motion, not against it. This is the fundamental insight of Acrobat strategy.

**Stage 3 (2,000-5,000 episodes):** Refinement. The agent learns to distinguish which phase of the swing it's in and applies torque more precisely. Average steps to goal decreases as the path becomes more direct.

**The key discovery**: the agent never receives any explicit information about "pump in resonance with the natural frequency." It discovers this purely from the -1 per step reward gradient. The shortest-episode-length reward signal implicitly encodes "find efficient trajectories."

## Acrobat vs CartPole Comparison

Both use the same DQN architecture (6 -> 128 -> 128 -> 3). The differences are in the reward landscape:

**CartPole**: reward is binary survival. Every step you're alive is +1, then sudden 0 at failure. The Q-values learn "this state is dangerous, that state is safe."

**Acrobat**: reward is cumulative penalty (-1/step). The Q-values learn "from this state, the expected remaining steps to goal is X." States with high angular momentum in the right direction have lower expected remaining time.

This is why Acrobat training is slower: the Q-values need to estimate a continuous-valued "time to goal" rather than a binary "will I survive?" The value estimates require more data to converge.

## The Physics DQN Must Learn

The Acrobat dynamics are non-linear coupled differential equations. The angular acceleration of each link depends on the other link's angle and velocity:

```python
d1 = LINK_MASS * LINK_COM**2 + LINK_MASS * (
     LINK_LENGTH**2 + LINK_COM**2 + 2*LINK_LENGTH*LINK_COM*cos(theta2)) + 2*MOI

d2 = LINK_MASS * (LINK_COM**2 + LINK_LENGTH*LINK_COM*cos(theta2)) + MOI

ddtheta2 = (torque + d2/d1 * phi1 - LINK_MASS*LINK_LENGTH*dtheta1**2*sin(theta2) - phi2) /
           (LINK_MASS*LINK_COM**2 + MOI - d2**2/d1)
```

The agent never sees these equations. It just observes the (cos, sin, vel) state and applies torques. Over 5,000 episodes of trial and error, the DQN network *implicitly encodes* the inverse dynamics - learning which state-action pairs produce useful trajectories.

This is what makes RL compelling: it can learn control policies for systems where explicitly programming the inverse dynamics would be extremely complex.

## Comparison to Other Approaches

**PD Controller**: A hand-tuned PD controller can solve Acrobat if the gains are set correctly. It requires knowledge of the natural frequency. The DQN discovers an equivalent strategy without this knowledge.

**Linear Quadratic Regulator (LQR)**: Standard control theory. Works well near the upright position but poorly for the swing-up from rest (the system is too non-linear far from the goal).

**Model-based RL**: If you have the dynamics model (the equations above), you can plan trajectories directly. Faster to train, requires domain knowledge.

**DQN (model-free)**: No dynamics knowledge needed. Slower to train, but applicable to problems where the dynamics aren't known analytically - robotics with flexible links, systems with contact physics, anything where the equations are intractable.

Acrobat represents an interesting middle ground: the dynamics are analytically known, but learning the policy from scratch demonstrates that DQN can discover physically reasonable strategies purely from reward signals.

## Running the Code

```python
# The key reward structure
reward = -1.0  # per step
done = (-cos(theta1) - cos(theta2 + theta1) > 1.0) or steps >= 500

# Agent trains for 5000 episodes on random starts near equilibrium
env = AcrobatEnv()
for ep in range(5000):
    s = env.reset()  # theta1, theta2 near 0, velocities near 0
    while True:
        a = agent.act(s)
        s2, r, done = env.step(a)
        agent.remember(s, a, r, s2, done)
        agent.learn()
        s = s2
        if done: break
```

90-95% solve rate in 5,000 episodes. Average ~180 steps to reach goal vs 490 random. The physics it had to discover: energy pumping, resonance timing, coupled link dynamics. All from a -1/step reward signal.

![Training curves: solve rate and steps to goal over 5,000 episodes]({static}images/training_curves.png)
