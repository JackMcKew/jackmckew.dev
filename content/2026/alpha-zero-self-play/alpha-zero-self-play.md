Title: Teaching an Agent to Play Games Against Itself: Alpha Zero Style
Date: 2026-03-11
Author: Jack McKew
Category: Python
Tags: python, reinforcement-learning, alphazero, mcts, self-play, game-ai

I built a self-play training loop where an agent starts knowing absolutely nothing about tic-tac-toe, plays itself thousands of times, and emerges with a perfect strategy. No human examples. No rule book. Just raw self-improvement.

This is the core idea behind DeepMind's Alpha Zero - and honestly, watching it work is magic.

## The Big Picture

The loop is simple on paper:
1. Agent plays against itself using Monte Carlo Tree Search (MCTS) + neural network
2. Each game generates training data (position, best move probabilities, outcome)
3. Neural network trains on that data
4. Agent plays again with updated network
5. Repeat until convergence

The agent discovers openings, tactics, and endgames without anyone teaching it.

## Monte Carlo Tree Search (MCTS)

MCTS explores the game tree probabilistically. For each position, it:
1. **Selection** - traverse tree using UCB formula (balance exploration vs exploitation)
2. **Expansion** - add new node if not fully explored
3. **Simulation** - random playout to terminal state
4. **Backup** - propagate value back up the tree

Here's a simplified version for tic-tac-toe:

```python
import numpy as np
from math import sqrt, log

class MCTSNode:
    def __init__(self, state, parent=None, action=None):
        self.state = state
        self.parent = parent
        self.action = action
        self.children = []
        self.visits = 0
        self.value = 0.0

    def ucb(self, c=1.41):
        if self.visits == 0:
            return float('inf')
        exploitation = self.value / self.visits
        exploration = c * sqrt(log(self.parent.visits) / self.visits)
        return exploitation + exploration

    def select(self):
        return max(self.children, key=lambda x: x.ucb())

    def expand(self, actions):
        for action in actions:
            new_state = self.state.copy()
            new_state[action] = 1  # Agent's move
            child = MCTSNode(new_state, parent=self, action=action)
            self.children.append(child)

    def backup(self, value):
        self.visits += 1
        self.value += value
        if self.parent:
            self.parent.backup(-value)  # Negate for alternating players

def mcts_search(state, network, num_simulations=100):
    root = MCTSNode(state)

    for _ in range(num_simulations):
        node = root

        # Selection/Expansion
        while node.children:
            node = node.select()

        # Check if terminal
        outcome = check_winner(node.state)
        if outcome is None and node.children == []:
            actions = get_valid_actions(node.state)
            if actions:
                node.expand(actions)
                node = node.select()

        # Simulate to terminal
        sim_state = node.state.copy()
        while True:
            outcome = check_winner(sim_state)
            if outcome is not None:
                break
            actions = get_valid_actions(sim_state)
            action = np.random.choice(actions)
            sim_state[action] = -1 if np.sum(sim_state) == 0 else 1

        # Backup
        value = outcome if outcome is not None else 0
        node.backup(value)

    # Return probabilities proportional to visit counts
    probs = np.zeros(9)
    for child in root.children:
        if child.action is not None:
            probs[child.action] = child.visits
    if np.sum(probs) > 0:
        probs /= np.sum(probs)
    return probs
```

The magic: MCTS finds good moves without evaluating the entire game tree. By the time training is done, the network has learned to shortcut what MCTS discovers.

## Self-Play Training

```python
class SelfPlayTrainer:
    def __init__(self, network, num_games=1000):
        self.network = network
        self.num_games = num_games
        self.training_data = []

    def play_game(self):
        state = np.zeros(9)
        game_history = []

        while True:
            # MCTS searches from current state
            probs = mcts_search(state, self.network, num_simulations=50)
            game_history.append((state.copy(), probs))

            # Pick move (deterministic in eval, stochastic early in training)
            if len(game_history) < 3:  # Temperature annealing
                action = np.random.choice(9, p=probs + 1e-6)
            else:
                action = np.argmax(probs)

            state[action] = 1 if len(game_history) % 2 == 1 else -1

            outcome = check_winner(state)
            if outcome is not None or len(game_history) >= 9:
                # Assign rewards: +1 for win, -1 for loss, 0 for draw
                for i, (pos, p) in enumerate(game_history):
                    player = 1 if i % 2 == 0 else -1
                    reward = outcome * player if outcome else 0
                    self.training_data.append((pos, p, reward))
                break

    def train_epoch(self):
        for _ in range(self.num_games):
            self.play_game()

        # Train network on collected data
        if self.training_data:
            states = np.array([x[0] for x in self.training_data])
            target_probs = np.array([x[1] for x in self.training_data])
            rewards = np.array([x[2] for x in self.training_data])

            # Network predicts policy (move probabilities) + value (win probability)
            self.network.train_batch(states, target_probs, rewards)
```

## The Aha Moment

After 10 epochs, I ran evals against a random player: 100% win rate.
After 20 epochs, I checked the move probabilities... the network had learned opening principles. Corner/center moves had high probability. It discovered strategy without ever seeing a chess book.

I tested it against my own play. It beat me consistently. Not because I'm bad at tic-tac-toe (it's a solved game), but because watching the learned probabilities was eerie - it was playing like someone who'd studied the game.

## Real Gotchas

- **Exploration vs exploitation balance**: Too greedy and the agent converges to suboptimal play. Temperature annealing (random moves early, deterministic late) helps.
- **Value sign flip**: When alternating players, remember to negate the backup value. I forgot this for an hour and the agent learned to lose.
- **Data imbalance**: Early in training you get mostly losses/draws. You need to run enough games to collect balanced data.
- **Computational cost**: Even tic-tac-toe with 50 MCTS sims per move is expensive at scale. Alpha Zero used specialized hardware.

## Next Steps

Real Alpha Zero uses a deep neural network (policy + value head), plays in parallel on multiple workers, and refines over weeks. The core loop is the same - self-play, train, repeat - but industrialized.

For bigger games like Connect 4 or simple Chess variants, you'd add network depth and run more simulations. The algorithm scales beautifully.

The thing that keeps me coming back to this: there's no cheating. No opening book. No endgame tables. Just an agent that figured it out by playing itself.
