Title: AI Learns Flappy Bird (And Why It's Harder Than It Looks)
Date: 2026-03-12
Author: Jack McKew
Category: Python
Tags: reinforcement-learning, flappy-bird, dqn, reward-shaping, game-ai

Flappy Bird is a meme. Two pipes with a gap. Tap to survive. A seven-year-old can figure it out in ten minutes.

A DQN agent took 5,000 training episodes and still only averages 0.42 pipes passed per game.

That gap between human intuition and agent performance tells you a lot about where deep RL actually struggles.

## The Environment

Pure Python physics simulation - no game library. The bird falls under gravity (0.5 px/step²). Tapping sets velocity to -8 px/step (upward). Pipes scroll left at 3 px/step. Gap height: 80px. World height: 300px.

The state is 6 numbers:

```python
def _state(self):
    ahead = [p for p in self.pipes if p[0] + PIPE_W > bird_x]
    p = min(ahead, key=lambda p: p[0])    # nearest pipe
    return np.array([
        self.bird_y  / H,        # bird height (normalised)
        self.bird_vy / 15.0,     # bird velocity
        (p[0] - bird_x) / W,     # distance to next pipe
        p[1] / H,                # gap top y
        p[2] / H,                # gap bottom y
        (self.bird_y - gap_ctr) / H,  # offset from gap centre
    ], dtype=np.float32)
```

Everything the agent theoretically needs: where it is, how fast it's falling, where the gap is, and how far off-centre it is. The policy should be simple: flap when you're below the gap centre, coast when you're above it.

## What It Learned: Better Than Random, Short of Competent

| Metric | Random | Trained (5K eps) |
|--------|--------|-------------------|
| Avg pipes passed | ~0.05 | 0.42 |
| Avg steps survived | 30 | 105 |
| Best run (eval) | 1 | 8+ |

The agent improved roughly 8x over random on pipe count. It learned *something* - it doesn't just die in the first 30 steps anymore (105 avg vs 30 for random). But it never achieved consistent, clean flight.

## Why Flappy Bird Resists DQN

**Reward sparsity.** The only meaningful rewards are: +5 for each pipe passed, -10 for dying, and +0.1 per step survived. The problem: you have to survive 180 steps to even *encounter* the first pipe. In the early thousands of training episodes, the agent mostly dies before seeing any reward. The sparse +5 signal takes thousands of near-misses to propagate backwards through the Q-network.

**Catastrophic forgetting.** The learning curves for Flappy Bird are noisy in a distinctive way. The agent learns to thread a gap at episode 500, then *forgets* how at episode 800 (avg score drops from 2.47 back to 0.47). The experience replay buffer helps, but with 30,000-step buffer capacity and 200 average steps per episode, old experiences that taught gap-threading are constantly being overwritten.

**Precision requirements.** CartPole needs a coarse push left/right. Flappy Bird needs precise vertical position control. Being 15px above gap-centre vs 5px above gap-centre are both "above centre" to a rough policy - but one clears the pipe and one doesn't. The 6-dim state captures the offset, but the network needs to learn a precise mapping from small state differences to timing decisions.

**The timing horizon.** When the pipe is far away (dx = 0.7), the optimal action depends on the pipe gap AND the current velocity AND where you'll be when you arrive. A good policy must reason 10-20 steps ahead. DQN with single-step Q-values and discount factor γ=0.99 technically handles this, but in practice the gradient signal is very weak for decisions made 20 steps before the critical moment.

## What It Actually Does

Frame-by-frame, the trained agent displays a strategy: it maintains roughly the middle altitude for most of the flight, then makes a correction flap when close to a pipe gap. It's not smooth or reliable - sometimes it overcorrects and clips the top pipe - but it's clearly a policy, not random noise.

The oscillations in the training curve (reward bouncing between -5 and +9) reflect a recurring failure mode: the agent learns to thread a specific gap geometry, the random pipe generation gives it an unusual gap, and it crashes. The policy generalizes to common gaps but fails on edge cases.

## The Gap Between 0.42 and Superhuman

Human players can pass 50+ pipes per run after 10 minutes of practice. The gap between 0.42 (trained DQN) and 50 (human) is not a gap in "intelligence" - it's a gap in sample efficiency.

A human sees one gap and immediately generalises: "gap is lower than I expected, so I need to fly lower." That generalisation transfers from the first pipe to the fiftieth. The DQN needs to see the same situation thousands of times before it builds a reliable Q-value for it.

The theoretical fix is either: (1) more training, (2) better reward shaping, or (3) model-based RL that can plan ahead. With shaped rewards (reward for being close to the gap centre, not just for passing it), the same architecture would likely reach 5-10 pipes per run within 5,000 episodes. But that requires careful engineering of what you reward - which is cheating slightly compared to "learn from the game itself."

## What Would Actually Solve This

**Advantage Actor-Critic (A2C/PPO)** handles sparse rewards better than DQN because it has a value baseline that stabilises training even without frequent rewards. Most "Flappy Bird solved by AI" demos you've seen online use PPO, not DQN.

**Reward shaping**: add a small bonus for being within 20px of the gap centre when passing through. This gives dense signal (every timestep near a pipe) rather than sparse (+5 for crossing).

**Larger network + longer training**: OpenAI's original Atari results used 50M frames of experience. We trained on 5,000 episodes × ~150 steps = 750,000 frames. At the Atari scale, Flappy Bird would likely converge to superhuman performance.

The honest result - 0.42 avg pipes - is more instructive than a hand-tuned system that "solves" the game. DQN works. It's just not magic.

![Training curves and score distributions]({static}images/training_curves.png)
