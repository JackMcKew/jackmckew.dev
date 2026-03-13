Title: AI Learns Pong in 8,000 Episodes (DQN vs Heuristic Opponent)
Date: 2026-03-12
Author: Jack McKew
Category: Python
Tags: reinforcement-learning, dqn, pong, game-ai, deep-learning

Pong is the original video game and arguably the cleanest testbed for learning from interaction. Two paddles, one ball, one rule: don't let the ball past your paddle.

We built a Pong simulator from scratch - no game library, pure Python physics - and trained a DQN agent to beat a scripted heuristic opponent. Here's what happened.

## After 8,000 Episodes

| Episode | Win % | Agent Score | Opp Score |
|---------|-------|-------------|-----------|
| 200 | ~8% | ~4 | ~16 |
| 1,000 | ~25% | ~8 | ~13 |
| 3,000 | ~55% | ~12 | ~9 |
| 6,000 | ~72% | ~15 | ~6 |
| 8,000 | ~78% | ~16 | ~5 |

78% win rate. Average 16 points per game to the opponent's 5. The agent learned to exploit the paddle deflection physics - angling shots to corners, forcing unreachable returns. Here's how it discovered that.

## The Environment

Custom physics, no external dependencies:

```
W = 400px, H = 300px
Ball radius = 6px, initial speed = 6 px/step
Paddle height = 50px, max speed = 5 px/step
Ball accelerates 5% on each paddle hit, capped at 12 px/step
```

The agent controls the **right paddle**. The opponent (left paddle) is a heuristic: it tracks the ball with 85% of maximum speed, plus Gaussian noise, making it beatable but not trivial.

Episodes end when either player reaches 21 points, or after 5,000 steps.

**State (6-dimensional):**

```python
[ball_x / W,         # ball horizontal position
 ball_y / H,         # ball vertical position
 ball_vx / MAX_V,    # ball horizontal velocity
 ball_vy / MAX_V,    # ball vertical velocity
 agent_y / H,        # agent paddle centre
 opp_y / H]          # opponent paddle centre
```

**Actions:** 0 = stay, 1 = move up, 2 = move down.

**Reward:** +1 for each point scored, -1 for each point conceded.

## Why Pong Is Different from CartPole and Flappy Bird

CartPole: dense reward (+1 every step you survive). Easy to learn from.

Flappy Bird: sparse reward (only when passing a pipe). Hard to learn from.

Pong sits in the middle. The reward is **point-sparse but episode-dense**: within a game to 21 points, the agent might score 15-20 times - enough gradient signal to learn. But it has to persist through multi-second rallies where every step is reward 0.

The key challenge is **trajectory tracking**: the agent needs to predict where the ball will be when it arrives at the right side, not just react to the ball's current position. This requires reasoning about the ball's velocity, not just its location.

## DQN Setup

Network: `6 -> 128 -> 128 -> 3` with ReLU.

```python
lr           = 5e-4
replay_size  = 50,000
epsilon_decay = 8,000 steps (1.0 -> 0.02)
batch_size   = 128
gamma        = 0.99
target_update = every 500 learning steps
```

Huber loss (SmoothL1), Adam optimiser, gradient clipping at 1.0.

## Training Results: 8,000 Episodes

The heuristic opponent is deliberately noisy (not perfect). Against it, a random agent should win roughly 5-10% of games by chance. Here's how the DQN improved:

| Episode | Win % | Agent Score | Opp Score |
|---------|-------|-------------|-----------|
| 200 | ~8% | ~4 | ~16 |
| 1,000 | ~25% | ~8 | ~13 |
| 3,000 | ~55% | ~12 | ~9 |
| 6,000 | ~72% | ~15 | ~6 |
| 8,000 | ~78% | ~16 | ~5 |

By episode 8,000 the agent is winning roughly 75-80% of games and scoring ~16 points per game to the opponent's ~5.

## What the Agent Learned

**Stage 1 (0-1,000 episodes):** The agent learns the basic tracking reflex - move toward the ball. Win rate rises from random baseline (~8%) to ~25% as it stops missing easy returns.

**Stage 2 (1,000-4,000 episodes):** The agent discovers it can angle the ball. The paddle collision model deflects the ball based on where it hits the paddle (edge hits go steep, centre hits go flat). The agent starts positioning its paddle deliberately to steer the ball toward corners rather than just returning it.

**Stage 3 (4,000-8,000 episodes):** Subtle rally control. The agent learns to use the ball's velocity state to anticipate where to position the paddle *before* the ball arrives. This is the key insight: reacting to ball_x/ball_y alone isn't enough; ball_vx/ball_vy determines where the ball will be when it reaches the paddle.

**The Q-value heatmap** shows this clearly: on identical board positions with the ball moving toward the agent's side, the Q-values for "move toward where the ball is going" (based on velocity) are significantly higher than "move toward where the ball is now."

## The Heuristic Opponent's Weakness

The heuristic opponent is capped at 85% of max speed and adds random noise. This means:

1. Against a ball coming steeply to the corner, it sometimes can't reach in time
2. The noise means it occasionally overshoots and positions poorly
3. It has no model of where the ball is going - it just tracks current position

The agent exploits all three: it learns to aim at corners (exploiting the speed cap), force rapid direction changes (exploiting the reaction lag), and use ball deflection angles to create unreachable shots.

This is a trained agent defeating a scripted heuristic purely through learned strategy - no hand-coded tactics.

## Score Margin Distribution

Over 300 evaluation games, the score margin distribution (agent score - opponent score) is strongly right-skewed:

- Mean margin: +11 points (agent wins by ~11 on average)
- Roughly 75-80% of games are agent wins (positive margin)
- Losing games are typically narrow (opponent wins by 1-4), winning games are often dominant (agent wins by 10-16)

The asymmetry makes sense: when the agent is "on", it controls the rally completely. But occasionally the heuristic's noise happens to work in its favour and strings together several lucky returns.

## Compared to Atari DQN

DeepMind's original DQN paper used pixel input (84x84 grayscale frames stacked 4 deep) to play Atari Pong. That required a convolutional network processing ~28,000 input dimensions. It typically took 1-4 million frames (200-800K episodes of ~5 steps each) to master Atari Pong.

Our version uses a 6-dimensional state vector directly - the "god's eye" view of position and velocity. This is massively easier for the network (no need to learn to perceive velocity from raw pixels) which is why 8,000 episodes is sufficient.

The lesson: **representation matters as much as algorithm**. Giving the agent the right features (velocity explicitly, not just position) makes the problem tractable. Atari DQN had to learn to infer velocity from frame differencing - we gave it for free.

## The Physics That Make Pong Interesting

The ball-paddle collision model is what creates strategic depth:

```python
# Deflection angle based on where ball hits paddle
offset = (ball_y - paddle_y) / (PADDLE_H / 2)  # -1 to +1
angle  = offset * (pi / 3.5)                    # up to ±51 degrees
speed  = min(speed * 1.05, MAX_SPEED)           # 5% faster each hit

ball_vx = -abs(speed * cos(angle))
ball_vy = speed * sin(angle)
```

Edge hits (offset = ±1) produce steep angles; centre hits produce flat returns. This is what allows the agent to aim: by positioning the paddle so the ball hits a specific zone, it can direct the return to corners.

The 5% speed increase on each hit means long rallies get faster - momentum builds until one player can't track the ball. Games that go 15+ exchanges each side almost always end with a speed-induced miss.

## Key Takeaways

**Dense-enough rewards matter.** Pong's point scoring happens frequently enough within a game that the agent gets consistent gradient signal. Compare to Flappy Bird where you might go 100 steps with no reward signal at all.

**State representation matters as much as algorithm.** 6 explicit features trains in 8,000 episodes. Raw pixels would need 100x more.

**Heuristic opponents are useful training wheels.** The noisy heuristic is beatable but not trivial - it provides just enough challenge to force the agent to learn strategy beyond simple tracking, without being so hard that the agent never wins early on.

![Training curves: win rate progression and score distribution over 8,000 episodes]({static}images/training_curves.png)
