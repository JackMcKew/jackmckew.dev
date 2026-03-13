Title: AI Learns Tic-Tac-Toe Through Self-Play
Date: 2026-03-12
Author: Jack McKew
Category: Python
Tags: reinforcement-learning, self-play, tic-tac-toe, dqn, game-theory, minimax

Tic-Tac-Toe is a solved game. Give anyone a few minutes with a strategy guide and they'll never lose again. So why train an AI on it?

Because *how* it gets there is the interesting part. The agent starts knowing absolutely nothing - not the rules, not what winning looks like, nothing. It only knows: some board positions lead to a +1 reward, others to -1, and most to 0. Everything else it figures out from scratch by playing against itself.

After 10,000 episodes of self-play, the agent draws 100% of games against a perfect minimax solver. It discovered the optimal strategy without ever being told what "optimal" means.

## Fully Trained

| Opponent | Win | Draw | Loss |
|----------|-----|------|------|
| Random | 92.2% | 7.8% | 0% |
| Minimax (perfect) | 0% | **100%** | 0% |

Open any game - the trained agent takes the centre square immediately. Play optimally and every game ends in a draw. Play carelessly and you'll lose. It discovered these rules from nothing but +1/-1 outcomes across 10,000 self-play games.

<video autoplay loop muted playsinline width="100%"><source src="{static}images/ai-learns-tictactoe-self-play.mp4" type="video/mp4"></video>

Here's how it learned them.

## The Setup

The board is a 9-element vector: `{-1 = O, 0 = empty, 1 = X}`, always from the current player's perspective. The DQN outputs Q-values for all 9 positions; invalid moves (occupied cells) are masked to -∞ so the agent can never learn to play on taken squares.

The key mechanic is the **opponent lag**:

```python
OPP_UPDATE = 1000  # update opponent every K episodes

opponent = Agent()
opponent.policy.load_state_dict(agent_x.policy.state_dict())  # start as clone

for ep in range(N):
    play_episode(agent_x, opponent)
    agent_x.learn()
    if (ep + 1) % OPP_UPDATE == 0:
        opponent.policy.load_state_dict(agent_x.policy.state_dict())
```

Every 1,000 episodes, the opponent is updated to the latest policy. This is the simplest form of self-play - the opponent is always a slightly stale version of the learner. The agent must continuously improve to beat its own past self.

## What It Learned

The raw performance numbers:

| Opponent | Win | Draw | Loss |
|----------|-----|------|------|
| Random | 92.2% | 7.8% | 0% |
| Minimax (perfect) | 0% | **100%** | 0% |

The 100% draw rate against minimax is the maximum achievable. Tic-Tac-Toe is a draw under perfect play from both sides - if X starts in the centre and both players play optimally, the game always ends in a draw. A 0% loss rate means the agent never makes a losing move.

## The Self-Play Learning Curve Is Noisy - That's Expected

Self-play win rates are notoriously unstable. As the agent improves, the opponent (updated from the same policy) also improves. So the "win rate during training" swings wildly:

- Episode 500: 63.4% self-play wins, 86% vs random
- Episode 1000: 87.2% self-play wins, 93% vs random
- Episode 6500: 20.6% self-play wins, 97% vs random ← opponent caught up

The self-play win rate dropping from 87% to 20% isn't the agent getting *worse* - it's the opponent getting *better*. The vs-random performance tells the real story: it marched steadily upward from ~86% to ~97% and held there.

## Opening Move Analysis

On an empty board, the agent consistently chooses the **centre square (cell 4)**. This is the correct opening - the centre gives the most winning paths (4 potential wins: row, column, two diagonals). The agent discovered this purely from reward signals.

The Q-value heatmap on an empty board shows the corners valued second-highest, and edge squares lowest. This matches human-derived Tic-Tac-Toe strategy exactly.

## Why It Hits a Wall at ~100% Draws vs Minimax

The agent draws 100% against minimax, which sounds perfect. But there's a subtle issue: minimax *guarantees* a draw when going second (as O). So the "100% draws" result partly reflects minimax's own invincibility, not just the agent's skill.

The harder question is: can the agent *win* against a weaker-than-perfect opponent while still not losing to minimax? The 92% win rate against random shows it can exploit suboptimal play, but it can't force a win against optimal play. That's not a failure - it's the mathematical ceiling for Tic-Tac-Toe.

## Self-Play vs Pre-Defined Opponent

An alternative approach is training against a fixed opponent (random, or a rule-based bot). Self-play has a key advantage: the opponent automatically scales to the learner's level. You don't need to engineer difficulty - the agent always faces a challenge just beyond its current ability.

The downside: self-play can cycle. If the agent learns to exploit strategy A, the opponent adapts, so the agent unlearns A and learns B, then the opponent adapts again. This is the "rock-paper-scissors problem" in multi-agent RL. For Tic-Tac-Toe the game tree is small enough that this doesn't matter - the agent eventually saturates the problem. For larger games (chess, Go), you need more sophisticated approaches like the population-based training used in AlphaZero.

## The Network

Just a small MLP - 9 inputs (board cells), two 128-unit hidden layers, 9 outputs (Q-value per cell). No convolution needed: the game is small enough that a flat representation works.

```python
class Net(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(9, 128), nn.ReLU(),
            nn.Linear(128, 128), nn.ReLU(),
            nn.Linear(128, 9),
        )
```

The Q-values are the raw scores for each position; invalid moves are filtered out before the argmax. This is cleaner than trying to learn a policy that inherently avoids illegal moves.

## What's Next

Tic-Tac-Toe is trivially solvable, so the interest here is in the mechanism - not the destination. The same self-play framework scales to:

- **Connect 4**: larger game tree, same structure
- **Othello/Reversi**: strategy emerges more clearly over a longer training run
- **Chess**: requires a much deeper network and proper MCTS integration (AlphaZero territory)

The key insight that scales all the way up: you don't need labelled data, expert demonstrations, or hand-crafted heuristics. Just two agents, a reward signal, and time.

![Training curves and Q-value heatmap]({static}images/training_curves.png)
