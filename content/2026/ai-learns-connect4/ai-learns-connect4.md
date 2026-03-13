Title: AI Learns Connect 4 Through Self-Play (DQN)
Date: 2026-03-12
Author: Jack McKew
Category: Python
Tags: reinforcement-learning, dqn, self-play, connect4, game-ai, deep-learning

Tic-Tac-Toe has 255,168 possible games. Connect 4 has 4,531,985,219,092. That's 18 million times more states.

When we trained DQN on Tic-Tac-Toe using self-play, it achieved perfect play - 100% draws against minimax - in 10,000 episodes. Connect 4 is a different beast entirely. Let's see how far self-play gets on a genuinely hard game.

## After 15,000 Episodes

| Episode | Win % vs Random | Draw % | Loss % |
|---------|----------------|--------|--------|
| 500 | ~55% | ~10% | ~35% |
| 2,000 | ~70% | ~15% | ~15% |
| 5,000 | ~82% | ~12% | ~6% |
| 10,000 | ~88% | ~8% | ~4% |
| 15,000 | ~90%+ | ~7% | ~3% |

~90% win rate against random opponents. The agent opens with the centre column, blocks three-in-a-row threats reliably, and recognises forced-win sequences. It competes meaningfully against depth-4 minimax. Here's the full training story.

## Why Connect 4 Is Hard

The board is 7 columns x 6 rows. Players alternate dropping pieces from the top. First to connect 4 in a row - horizontal, vertical, or diagonal - wins.

Unlike Tic-Tac-Toe, Connect 4 is mathematically solved: the first player always wins with perfect play. But "perfect play" requires searching a game tree millions of nodes deep. Connect 4 was solved computationally in 1988 by James Dow Allen.

The challenges for DQN:

- **State space**: 4.5 trillion possible positions vs 5,478 for Tic-Tac-Toe
- **Horizon**: games can go up to 42 moves, vs 9 for Tic-Tac-Toe
- **Delayed consequences**: a move that looks neutral now might be critical 10 moves later
- **Combinatorial explosion**: the game tree is exponentially deeper than minimax can fully evaluate

## Architecture

State: 7x6x3 tensor, flattened to 126 dimensions:
- Channel 1: own pieces (0/1 per cell)
- Channel 2: opponent pieces (0/1 per cell)
- Channel 3: valid columns (1 for open, 0 for full)

Always represented from the current player's perspective - identical to the Tic-Tac-Toe approach.

```python
def board_to_state(board, player):
    own   = (board == player).astype(np.float32)     # 7x6
    opp   = (board == -player).astype(np.float32)    # 7x6
    valid = np.zeros((ROWS, COLS), dtype=np.float32)
    for c in valid_cols(board):
        valid[:, c] = 1.0
    return np.stack([own, opp, valid], axis=0).flatten()  # 126-dim
```

Network: `126 -> 256 -> 256 -> 128 -> 7` with ReLU. Invalid column outputs masked to -inf before action selection.

**Self-play setup:**
- Agent trains against a lagged copy updated every 1,500 episodes
- Opponent also uses 10% random moves to prevent degenerate equilibria
- Episode reward: +1 for win, -1 for loss, 0 for draw
- Delayed credit assignment: after opponent's move, the agent's previous action gets reward 0 (neutral), and only terminal rewards propagate back

## Training: 15,000 Episodes

The results against a random opponent show clear and steady improvement:

| Episode | Win % vs Random | Draw % | Loss % |
|---------|----------------|--------|--------|
| 500 | ~55% | ~10% | ~35% |
| 2,000 | ~70% | ~15% | ~15% |
| 5,000 | ~82% | ~12% | ~6% |
| 10,000 | ~88% | ~8% | ~4% |
| 15,000 | ~90%+ | ~7% | ~3% |

Against minimax depth-4 (which looks 4 moves ahead), the story is different - the agent learns to compete but rarely outplays it.

## What the Agent Learned

**Opening preference**: On an empty board, the Q-values strongly favour the centre column (column 3). This is correct - centre control is the strongest opening in Connect 4, giving access to more winning lines. The agent discovered this independently through self-play.

**Blocking**: By episode 3,000, the agent blocks obvious 3-in-a-row threats nearly 100% of the time. This is the first sign of strategic play - recognising that the opponent's position matters as much as your own.

**Forced wins**: By episode 8,000-10,000, the agent recognises and executes "forced win" sequences - situations where it creates two threats simultaneously and the opponent can only block one. These are the fundamental winning patterns in Connect 4 strategy.

## The Self-Play Win Rate Is Unstable

Just like in Tic-Tac-Toe, the "vs minimax" metric oscillates. At episode 5,000 it might reach 25% wins, then drop to 10% at episode 6,000 as the lagged opponent copies the improved policy and becomes harder.

This is the core challenge of self-play: your opponent adapts to you. The learning curve isn't monotone. The metric to watch is performance against a fixed benchmark (random, or minimax) rather than the self-play win rate itself.

## Compared to Tic-Tac-Toe

| Metric | Tic-Tac-Toe | Connect 4 |
|--------|-------------|-----------|
| State space | ~5,500 | 4.5 trillion |
| Network size | 9->128->128->9 | 126->256->256->128->7 |
| Episodes | 10,000 | 15,000 |
| vs Random (final) | ~92% W | ~90% W |
| vs Perfect play | 100% D | Can't match (too deep) |

The raw win rates look similar against random. The difference shows against strong opponents: Tic-Tac-Toe DQN achieved perfect play. Connect 4 DQN reaches a competitive intermediate level - it beats random easily, challenges depth-4 minimax, but falls short of optimal play.

This gap reflects the difference between a solvable game with ~5K states and one with 4.5 trillion. DQN generalises across states it hasn't seen, but with 15,000 episodes of experience against ~126-dimensional states, it can't learn the full game tree the way minimax explicitly searches it.

## When Self-Play Scales - and When It Doesn't

AlphaGo Zero used self-play to master Go (a game with more states than atoms in the observable universe). The difference:

- **MCTS + neural network**: AlphaGo uses Monte Carlo Tree Search guided by a neural network, not pure Q-learning. MCTS explicitly simulates lookahead, which is critical for games with long horizons.
- **Scale**: AlphaGo trained on TPU clusters for days/weeks. Our DQN trained for ~45 minutes on a CPU.
- **Value + policy heads**: AlphaGo uses a combined value/policy network, not just Q-values.

For Connect 4 specifically, pure DQN self-play will plateau well below optimal because:
1. The horizon is too long for Q-value propagation to reliably assign credit
2. Without lookahead (MCTS), the agent can't recognise "I should sacrifice position now for a forced win in 8 moves"

The right tool for Connect 4 is minimax with alpha-beta pruning - it's guaranteed to find optimal play. But "guaranteed optimal" requires exhaustive search, which doesn't scale to Go or Chess. That's where learned value functions and MCTS come in.

## The Code

The full environment, DQN agent, minimax oracle, and self-play training loop are all custom Python with PyTorch:

```python
def play_episode(agent, opp_weights):
    opp_net = Net()
    opp_net.load_state_dict(opp_weights)
    board  = make_board()
    player = 1   # agent goes first
    prev   = None  # agent's previous (state, action)
    while True:
        vc    = valid_cols(board)
        state = board_to_state(board, player)
        if player == 1:
            action = agent.act(state, vc)
        else:
            # Lagged opponent + 10% random
            if random.random() < 0.10:
                action = random.choice(vc)
            else:
                q = opp_net(torch.FloatTensor(state).unsqueeze(0))[0]
                action = int((q + mask).argmax())
        board, _ = drop(board, action, player)
        if check_win(board, player):
            reward = 1.0 if player == 1 else -1.0
            # ... store terminal transition
            break
        player = -player
```

15,000 episodes of self-play producing an agent that beats 90% of random opponents and competes meaningfully against depth-4 minimax - all from scratch, no game knowledge built in.

![Training curves: win rate vs random and minimax over 15,000 episodes]({static}images/training_curves.png)
