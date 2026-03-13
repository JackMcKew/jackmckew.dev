Title: AI Learns Breakout: From Missing Every Ball to Clearing the Board
Date: 2026-03-12
Author: Jack McKew
Category: Python
Tags: reinforcement-learning, dqn, breakout, game-ai, deep-learning, atari

Breakout is where DeepMind's DQN first shocked the world in 2015. Their agent learned to play Atari games from raw pixels alone, eventually discovering the "tunnel strategy" - drilling a hole through the side of the brick wall and bouncing the ball behind it for massive scoring.

We built a Breakout simulator from scratch (no game library) and trained a DQN on explicit physics state rather than pixels. The result shows what DQN learns first, what it learns later, and why the original Atari version is so much harder.

## After 8,000 Episodes

| Episode | Avg Bricks/40 | Win Rate |
|---------|--------------|---------|
| 200 | ~3-5 | 0% |
| 1,000 | ~10-15 | 0% |
| 3,000 | ~20-28 | 5-15% |
| 6,000 | ~30-35 | 40-60% |
| 8,000 | ~35+ | 60-75% |

60-75% win rate, averaging 35+ bricks per game out of 40. The agent taught itself paddle deflection angles to steer the ball toward remaining bricks, working up through all 5 rows. Here's how.

## The Environment

A 400x300px game with:
- 5 rows x 8 columns = **40 bricks** arranged at the top
- Ball starts above the paddle moving upward at a random angle
- Agent controls paddle (left/right/stay)
- Ball deflects off paddle with angle based on where it hits
- Episode ends: all bricks cleared (win) or ball falls below paddle (loss)

**State (13-dimensional):**

```python
[ball_x / W,          # ball position
 ball_y / H,
 ball_vx / MAX_V,     # ball velocity
 ball_vy / MAX_V,
 paddle_x / W,        # paddle centre
 row0_frac,           # fraction of row 0 bricks remaining (0-1)
 row1_frac,           # ... rows 1-4
 row2_frac,
 row3_frac,
 row4_frac,
 top_brick_row / 5,   # which row has bricks (progress indicator)
 bricks_remaining / 40]  # total progress
```

**Actions:** stay (0), move left (1), move right (2).

**Reward:** +1 per brick destroyed, -1 for missing the ball, +10 bonus for clearing all bricks.

The ball deflects off the paddle based on impact position (edge hits go steep, centre hits go flat) - creating strategic depth.

## The Atari Version vs This Version

DeepMind's original DQN used:
- **Input**: 4 stacked 84x84 grayscale frames = 28,224-dimensional input
- **Network**: 3 convolutional layers + 2 dense layers
- **Training**: 50 million frames (several weeks on a GPU)
- **Key challenge**: the network had to *infer* ball velocity from frame differences, learn visual representations from scratch

Our version:
- **Input**: 13 explicit physics features
- **Network**: 3 dense layers (13 -> 128 -> 128 -> 3)
- **Training**: 8,000 episodes (~hours on CPU)
- **Key advantage**: velocity is explicitly provided, so no visual inference needed

This is the "state representation" advantage. The hard part of Atari Breakout is *perceiving* the game, not *playing* it. We skip that entirely.

## Training Progress

| Episode | Avg Bricks/40 | Win Rate | Notes |
|---------|--------------|---------|-------|
| 200 | ~3-5 | 0% | Basic paddle tracking |
| 1,000 | ~10-15 | 0% | Reliable returns, targeting bottom rows |
| 3,000 | ~20-28 | 5-15% | Consistent mid-game, angle control emerging |
| 6,000 | ~30-35 | 40-60% | Strong play, regularly reaches top rows |
| 8,000 | ~35+ | 60-75% | Often clears the board |

## What the Agent Learns (In Order)

**Stage 1: Don't miss the ball.** The immediate pressure of a -1 miss penalty teaches the agent to track the ball. By episode 200, it reliably returns the ball most of the time.

**Stage 2: Aim at bricks.** With ball-tracking mastered, the reward signal starts teaching the agent to *position* its paddle to deflect the ball toward remaining bricks. Edge hits produce steep angles; the agent learns that angled returns can reach more brick configurations.

**Stage 3: Target the right rows.** The row-fraction state features tell the agent which rows have bricks remaining. By episode 3,000, the agent preferentially angles the ball toward denser rows rather than shooting randomly.

**Stage 4: The upper-row challenge.** Top rows require many bounces (ball must travel far and back repeatedly). Getting there requires not just ball control but sustained rally length. Games that reach the top rows become longer and more complex.

**Stage 5: Clearing the board.** Win rate increases as the agent learns to complete the endgame - the last few bricks in awkward positions. These require precise angle control: the ball must bounce off specific corners of the remaining bricks.

## The Tunnel Strategy - Does It Emerge?

DeepMind's original Atari DQN discovered the tunnel strategy: aim repeatedly at one side column until the ball breaks through to bounce between the top wall and back of the brick grid, scoring rapidly.

**Our version doesn't develop this.** The reason: our state representation tells the agent about row fractions but not column fractions. The agent doesn't have enough information to specifically target a column.

This is an intentional simplification - and it shows how representation shapes learned behaviour. A modified state with column fractions as well would likely lead to column-targeting strategies. The original Atari DQN "saw" the full grid through its convolutional features and naturally learned the column tunnel.

## Reward Signal Analysis

The reward structure does a lot of work:

**+1 per brick**: creates a dense reward signal. Unlike Flappy Bird (one reward per pipe every ~100 steps), Breakout can yield 5-10 rewards in a single episode from the first rally. This makes DQN effective here.

**-1 for missing**: strong negative reinforcement that keeps paddle-tracking the primary priority. Without this, the agent might ignore the ball and just sweep randomly hoping to score stray rewards.

**+10 clear bonus**: pushes the agent to complete boards rather than playing conservatively. Without it, the agent might avoid risky high shots (which could miss the ball) even when it has 39/40 bricks cleared.

## Why DQN Works Well Here

Breakout has an unusual property: **dense intermediate rewards**. Every brick hit gives +1. With 40 bricks per game and games lasting hundreds of steps, the agent gets useful gradient signal early.

Compare this to problems where DQN struggles:
- Flappy Bird: reward only when passing a pipe (sparse)
- Rocket landing: reward only at terminal state (very sparse)
- Montezuma's Revenge (hard Atari game): reward only after solving multi-room puzzles (extremely sparse)

Breakout's brick rewards make it almost a tutorial for DQN - there's always something to learn from within the episode. This is why the original DQN team used it as one of their first demonstration games.

## The State Representation Trade-off

We made Breakout tractable by providing:
1. Explicit velocity (ball_vx, ball_vy)
2. Row-level brick summary rather than individual brick positions
3. Progress indicators (top_brick_row, bricks_remaining)

The trade-off: the agent can't learn the tunnel strategy without column information. But it can learn a strong general policy in 8,000 episodes instead of 50 million frames.

This is the fundamental tension in RL feature engineering: richer state = more learnable but potentially with hand-designed biases; raw pixels = unbiased but requires enormous data.

For applications where you control the state representation (robotics, trading, scheduling), explicit engineered features almost always beat raw sensor data given limited compute. For applications where you *don't* control the input (Atari games, raw video), convolutional networks are necessary.

## The Code

The brick collision uses AABB (Axis-Aligned Bounding Box) with face detection:

```python
# Determine which face was hit for correct deflection
overlap_top   = (ball_y + BALL_R) - brick_top
overlap_bottom = (brick_top + BRICK_H) - (ball_y - BALL_R)
overlap_left  = (ball_x + BALL_R) - brick_left
overlap_right = (brick_left + BRICK_W) - (ball_x - BALL_R)

min_overlap = min(overlap_top, overlap_bottom, overlap_left, overlap_right)
if min_overlap == overlap_top:
    ball_vy = -abs(ball_vy)   # deflect up
elif min_overlap == overlap_bottom:
    ball_vy = abs(ball_vy)    # deflect down
# ... left/right cases
```

8,000 episodes, 60-75% win rate, average 35+ bricks per game. From a network that's never seen Breakout before.

![Training curves: bricks destroyed and win rate over 8,000 episodes]({static}images/training_curves.png)
