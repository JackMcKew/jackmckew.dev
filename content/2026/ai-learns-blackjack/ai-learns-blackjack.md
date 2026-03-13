Title: AI Learns Blackjack: RL Against a Solved Game
Date: 2026-03-12
Author: Jack McKew
Category: Python
Tags: reinforcement-learning, monte-carlo, dqn, blackjack, q-learning, deep-learning

Most RL benchmarks don't have a known optimal policy. You train, you measure win rates, but you never know how far off you are from truly optimal play.

Blackjack is different. The optimal strategy - basic strategy - is analytically derived and publicly known. Every state has a mathematically correct action. So when we train RL agents on blackjack, we can measure not just how well they perform, but how close they get to the known ceiling.

Three agents. One optimal baseline. 500,000 hands each.

## Final Results (50,000 Evaluation Hands)

| Agent | Win % | Draw % | Loss % | vs Optimal |
|-------|-------|--------|--------|-----------|
| Random | 28.8 | 8.2 | 63.0 | -15.0pp |
| Monte Carlo | 43.1 | 8.7 | 48.2 | -0.7pp |
| DQN | 42.6 | 8.5 | 48.9 | -1.2pp |
| **Optimal (basic strategy)** | **43.8** | **8.6** | **47.6** | 0 |

Monte Carlo gets within 0.7 percentage points of the mathematically proven optimal, independently discovering the key rules of basic strategy from 500,000 hands of +1/-1 outcomes.

<video autoplay loop muted playsinline width="100%"><source src="{static}images/ai-learns-blackjack.mp4" type="video/mp4"></video>

Here's how each approach works and why MC beats DQN here.

## The Setup

Simplified blackjack - no splitting, no doubling down. One dealer, one player.

**State (3-dimensional):**
```
(player_sum, dealer_card, usable_ace)
  player_sum:  4-21
  dealer_card: 1-10 (Ace=1, J/Q/K=10)
  usable_ace:  0 or 1
```

Total state space: 18 x 10 x 2 = 360 discrete states. Tiny by RL standards.

**Actions:** hit (1) or stand (0).

**Reward:** +1 win, 0 draw, -1 loss. Evaluated per hand - no intermediate rewards.

**Agents:**
1. **Random** - hits or stands at random. Baseline floor.
2. **Monte Carlo** - tabular Q-table, epsilon-greedy (epsilon decays from 1.0 to 0.05 over 500k hands).
3. **DQN** - two-layer neural network (3 -> 64 -> 64 -> 2), experience replay, target network.
4. **Basic Strategy** - the analytically optimal policy. Known ceiling.

## Why Monte Carlo for Blackjack

Most RL uses TD learning (Q-learning, SARSA) which updates value estimates after every step. Blackjack hands are short - typically 2-5 actions - and the reward only appears at the end.

Monte Carlo waits until the hand is complete, then updates Q-values for every (state, action) pair visited in that hand using the actual outcome. In a short-episode, sparse-reward game this is actually more sample-efficient than TD: you don't need to bootstrap from value estimates, you just use the real result.

With 360 states and binary actions, the MC Q-table only has 720 entries. It converges in a fraction of the time it would take on a continuous-state problem.

## Training Results

Both agents trained for 500,000 hands. Evaluated every 25,000 hands on 5,000 hands greedy play (epsilon = 0).

| Hands | MC Win % | DQN Win % |
|-------|----------|-----------|
| 25,000 | 36.5 | 33.2 |
| 50,000 | 39.8 | 37.8 |
| 75,000 | 41.2 | 40.1 |
| 100,000 | 42.1 | 41.4 |
| 150,000 | 42.9 | 42.3 |
| 200,000 | 43.3 | 42.6 |
| 300,000 | 43.5 | 42.8 |
| 500,000 | 43.5 | 42.9 |

MC converges faster and to a higher asymptote. Not surprising - a 720-entry Q-table learns a 360-state game more efficiently than a neural network with thousands of parameters.

## Final Evaluation (50,000 Hands)

| Agent | Win % | Draw % | Loss % | vs Optimal |
|-------|-------|--------|--------|-----------|
| Random | 28.8 | 8.2 | 63.0 | -15.0pp |
| Monte Carlo | 43.1 | 8.7 | 48.2 | -0.7pp |
| DQN | 42.6 | 8.5 | 48.9 | -1.2pp |
| **Optimal (basic strategy)** | **43.8** | **8.6** | **47.6** | 0 |

MC gets within 0.7 percentage points of the known optimal. DQN gets within 1.2pp. Both are well within the noise of a 50,000-hand evaluation (standard error ~0.2pp).

In practice: a human playing basic strategy beats random play by ~15 percentage points. MC essentially rediscovers basic strategy from scratch.

## What MC Actually Learned

The basic strategy table is a matrix of (player total, dealer upcard) -> hit/stand. Key rules most players know:

- Always stand on 17+
- Always hit on 8 or below
- Hit on soft 17 (Ace + 6) against dealer 7+
- Stand on 12 against dealer 4, 5, 6

Does MC learn these? After 500,000 hands, the Q-table's greedy policy matches the basic strategy table in roughly 340 of 360 states (~94%). The 20 mismatches are edge cases where the win probabilities are nearly identical and the correct action barely matters.

The agent never saw the strategy table. It discovered these rules from +1/-1 outcomes across half a million hands.

## DQN's Disadvantage Here

DQN underperforms MC on this problem for a structural reason: the state space is tiny.

A neural network with 64-unit hidden layers has thousands of parameters to represent a 360-state function. That's severe overparameterisation. The network has to generalise across states that don't need generalisation - each state can be memorised exactly in a lookup table.

DQN's advantages (generalisation, continuous states, image inputs) are liabilities here. It's using a sledgehammer on a thumbtack. MC's tabular approach is strictly better when the state space fits in memory.

This is the right tool for the right job lesson: don't default to deep RL because it sounds more sophisticated. If your state space is discrete and small, tabular methods converge faster and often reach better performance.

## The House Edge

With basic strategy, the player win rate is ~43.8% against a loss rate of ~47.6%. That 3.8pp gap is the house edge - the casino's structural advantage built into the rules (dealer wins ties on bust, player must act first).

No amount of RL eliminates the house edge. You can play perfectly and still lose money over time. What MC learned is how to minimise the edge - to play the mathematically correct action in every state so the casino's advantage is as small as the rules allow.

Card counting (not implemented here) shifts the edge by tracking the deck composition. That's a different problem - non-Markovian, partially observable, requiring state beyond the current hand.

## Comparing RL Approaches

| Property | Monte Carlo | DQN |
|----------|-------------|-----|
| State space | Tabular (360 states) | Neural network |
| Update timing | End of episode | After every step |
| Sample efficiency | High (short episodes) | Moderate |
| Scales to large states | No | Yes |
| Converges to optimal | ~94% state match | ~92% state match |
| Training speed | Fast | 3-4x slower |
| Best for | Small discrete games | Large/continuous spaces |

MC wins here. DQN would win on Atari (210x160 pixels, complex dynamics) or any problem where you can't enumerate states.

## Running the Code

```python
# MC update - called at end of each hand
def update_from_episode(self, episode):
    # episode = [(state, action, reward), ...]
    G = 0
    visited = set()
    for s, a, r in reversed(episode):
        G += r  # accumulate return (in blackjack, only the final step has non-zero reward)
        if (s, a) not in visited:
            visited.add((s, a))
            self.N[s][a] += 1
            # Incremental mean update
            self.Q[s][a] += (G - self.Q[s][a]) / self.N[s][a]

# Final win rates after 500k hands:
# Random:      28.8% win
# MC:          43.1% win  (0.7pp from optimal)
# DQN:         42.6% win  (1.2pp from optimal)
# Optimal:     43.8% win
```

500,000 hands. MC lands within 0.7pp of the mathematically proven optimal, using 720 Q-values and no neural network. Sometimes simple is better.

![Training curves: win rate over 500,000 hands for MC vs DQN]({static}images/training_curves.png)
