Title: Teaching an RL Agent to Play Carcassonne - Patterns From 1000 Training Iterations
Date: 2026-03-11
Author: Jack McKew
Category: Python
Tags: reinforcement-learning, ppo, carcassonne, board-game, ai, pytorch, self-play

I trained a PPO agent to play Carcassonne using self-play, then analysed 50 games of the trained model to see what it actually learned. The results are interesting - it has genuine preferences, not just noise. [Play against it in your browser here](#play-it).

## The problem with board games and RL

Most RL tutorials use fixed-size grids: Atari games have 84x84 pixels, Go has a 19x19 board, chess is 8x8. Carcassonne is awkward because the board grows dynamically as players place tiles. It can end up 10 tiles wide or 20 tiles wide depending on how players play.

The naive solution is a fixed maximum board size and zero-pad it. I tried this first. The problem is the policy has to learn "tile at position (15, 23) is different from position (16, 23)" which is meaningless - what matters is the local neighbourhood around the placement, not absolute coordinates.

The solution: a sliding window observation centred on the board centroid.

```python
def get_observation(self, perspective_player=None):
    # Find centroid of all placed tiles
    rows = [r for r, c in self.board.keys()]
    cols = [c for r, c in self.board.keys()]
    cr = round(sum(rows) / len(rows))
    cc = round(sum(cols) / len(cols))

    # Extract 9x9 window around centroid
    half = self.window // 2
    for wr in range(self.window):
        for wc in range(self.window):
            br = cr - half + wr
            bc = cc - half + wc
            if (br, bc) in self.board:
                encode_tile(self.board[(br, bc)])
            else:
                encode_empty()
```

This gives a 9x9 local view with 33 features per cell (15 tile type bits + 4 rotation bits + 8 edge bits + 4 meeple bits + 2 misc) plus global state. Total obs size: 9x9x33 + 21 = 2,613 dimensions.

The action space is window x window x 4 rotations x 5 meeple options = 1,620 discrete actions. Actions are always relative to the centroid window, so the same strategic pattern looks the same regardless of where on the board it occurs.

## The deck

Carcassonne has 15 tile types, 53 tiles total:

| Type | Count | Description |
|------|-------|-------------|
| RRc | 9 | curved road |
| RR | 8 | straight road |
| C | 5 | single city edge |
| M | 4 | monastery (all field) |
| RRRt | 4 | T-junction road |
| CC | 3 | two-city (connecting) |
| CCC | 3 | three-city edges |
| CRR | 3 | city + road |
| CCRRc | 3 | two-city + curved road |
| CRRRt | 3 | city + T-junction |
| Cp | 2 | city with pennant |
| CC_c | 2 | two adjacent cities |
| MR | 2 | monastery + road |
| CCCC | 1 | four-city (all city) |
| RRRRx | 1 | crossroads |

Roads dominate the deck (9+8+4+3+3+3+2+1 = 33 road tiles). Cities are present but less frequent per tile (many tiles have only one city edge). This matters for what the agent learned.

## Training setup

Self-play PPO: both players share one network, observations are always from the current player's perspective so the role is consistent regardless of which side you're on.

```python
class CarcassonneNet(nn.Module):
    def __init__(self, obs_dim, n_actions, hidden=256):
        super().__init__()
        self.backbone = nn.Sequential(
            nn.Linear(obs_dim, hidden),  # input projection
            nn.LayerNorm(hidden),
            nn.ReLU(),
            nn.Linear(hidden, hidden),   # deep layer 1
            nn.LayerNorm(hidden),
            nn.ReLU(),
            nn.Linear(hidden, hidden // 2),  # deep layer 2
            nn.ReLU(),
        )
        self.policy_head = nn.Linear(hidden // 2, n_actions)
        self.value_head = nn.Linear(hidden // 2, 1)
```

The reward function is simple: normalised score delta per step (`(score_after - score_before) / 10.0`) plus a terminal win/lose/draw signal of +1/-1/0.

Training ran for 1,000 iterations, 20 episodes per iteration, 4 PPO epochs per update. About 75 minutes on CPU.

## Training curve analysis

The training log shows a clear arc:

**Entropy (exploration):** Started at 2.68, decayed to 1.77 by iteration 1,000. Still above 1.0, so the agent never fully converged - it retained meaningful exploration throughout. Entropy drops fastest in the first 300 iterations as the agent transitions from random play to having a strategy.

**Policy loss:** Dropped from -0.049 to ~0.003, approaching zero. In PPO with self-play this is expected: when both players are using the same policy, the ratio between old and new log probs stays close to 1, so the clipped objective barely moves.

**Value loss:** This is the interesting one. It *increased* over training - from 0.26 to 0.64. This looks wrong but makes sense: as the policy becomes more consistent, games become more predictable, and the value function has to learn higher-variance score distributions from a narrower set of positions. The model is working harder to predict outcomes, not failing.

**Win rate:** Oscillates 35-75% throughout. Self-play win rates are naturally noisy - the agent plays both sides, so a "dominant strategy" just means both players use it equally. The oscillation comes from the policy momentarily improving against its older self, then the opponent (same weights) catching up on the next update.

## What did the agent actually learn?

I ran the trained model greedy for 50 games and tracked every decision.

**Meeple placement rate: 35%.** The agent skips meeple placement on 65% of turns. This is deliberate - it learned that premature meeple commitment is expensive. Carcassonne meeples don't return until a feature completes, so placing on a feature you can't finish quickly ties up a resource for many turns. The agent is conservative.

**Meeple target breakdown (924 meeple placements total):**
- Roads: 49% of meeple placements
- Cities: 40% of meeple placements
- Monasteries: 11% of meeple placements

Roads are preferred despite cities scoring 2 points per tile (vs 1 for roads). The reason becomes clear when you look at the deck: roads are far more common, so road features complete faster. A 2-tile city scores 4 points but requires waiting for the right city tile. A 2-tile road scores 2 points but is easy to close quickly. The agent optimised for speed-to-completion, not points-per-tile.

**Board extent:** Games average 9.0 x 9.2 tiles, almost exactly matching the 9x9 observation window. This is not a coincidence - the agent has learned to cluster gameplay near the centroid because that's where it has full visibility. Sparse expansion beyond the window creates blind spots.

**Average scores:** P0 = 30.2, P1 = 28.9 per game over 50 games. The small P0 advantage (first-mover) is typical for Carcassonne. Earlier in training (iter 50), scores were P0=26.1, P1=23.9 - the trained model scores about 4 points more per game per player.

## Emergent play patterns

**Road-first opening:** The starting tile (CRR) has a road running east-west. The agent consistently extends this road in one direction before branching to other features. Road features are fast to complete, so this generates early score and returns meeples quickly.

**Monastery avoidance:** Despite monasteries scoring 9 points when complete (surrounded by 8 tiles), the agent places meeples on them only 11% of the time. A monastery requires 8 surrounding tiles to score - far too slow for the agent's completion-speed strategy. It places monasteries as tiles (always valid since all edges are field) but rarely commits a meeple.

**Contested feature aversion:** The agent rarely places meeples into a feature where the opponent might already have one. In self-play this is circular reasoning - both sides avoid it - but the behaviour persists. Shared features are unpredictable (both players split the points), so the agent learned to prefer uncontested claims.

**Score exploitation not territory control:** Unlike classic Carcassonne human strategy, the agent doesn't block opponent features by strategically completing them. It focuses on its own score, not opponent denial. This is a consequence of the reward function - only positive score delta is rewarded. Blocking would require learning negative reward for opponents, which would require shaping the terminal signal differently.

## Transfer learning between board sizes

If you want to train on the unlimited board starting from an existing fixed-grid checkpoint (or continue training from an earlier unlimited checkpoint), I added transfer learning support:

```python
def load_transfer_weights(net_new, checkpoint_path):
    """
    Copy shape-compatible layers. Only the input projection (backbone[0])
    and policy head depend on obs_dim/n_actions - everything else transfers.
    """
    ckpt = torch.load(checkpoint_path, map_location='cpu')
    src = ckpt['state_dict']
    dst = net_new.state_dict()

    for key, val in src.items():
        skip = (
            key not in dst
            or dst[key].shape != val.shape
            or key.startswith('backbone.0.')  # input projection
            or key.startswith('policy_head.')  # output head
        )
        if not skip:
            dst[key] = val

    net_new.load_state_dict(dst)
```

This transfers layers 2 and 3 of the backbone (the 256->256 and 256->128 linear layers, their LayerNorms) and the value head. These layers learn general game-playing heuristics - "positions where features are nearly complete are good" - that apply regardless of board size. The input projection and policy head are re-initialised because their shapes change.

In practice, transfer from a 3x3 fixed-grid model (obs_dim=319) to the unlimited model (obs_dim=2,613) cuts early-training variance noticeably - the value estimates are better calibrated from iteration 1.

To use it:

```bash
python train.py --unlimited --window 9 --transfer checkpoints/fixed_model.pt
```

<a name="play-it"></a>
## Play it in your browser

I built a self-contained browser version with the full unlimited board, proper tile rendering (no overlapping features), and a heuristic AI opponent. The tile art uses arc-based city polygons and bezier road curves so each feature is visually distinct even on small tiles.

[**Play Carcassonne vs AI - carcassonne_game.html**](carcassonne_game.html)

Controls:
- Click a golden cell to place the current tile
- Press R to rotate before placing
- Click a meeple slot after placing to claim a feature
- Scroll to zoom, drag to pan

The AI uses greedy 1-ply search: for each legal placement, it estimates (immediate score gain) + (meeple value) and picks the best. No lookahead, but it plays competently enough to be a challenge.

## Source code

The full implementation:
- `carcassonne/game_unlimited.py` - unlimited board engine with Union-Find scoring
- `train.py` - PPO self-play training loop with transfer learning support
- `test_rules.py` - 101 rule compliance tests (all passing)
- `carcassonne_game.html` - browser game, no server required

The model does something interesting with an open-ended game - it learned genuine strategic preferences from pure self-play without any domain knowledge built in. The road preference, the conservative meeple strategy, the clustering near the observation window centroid. These weren't programmed. They emerged from 1,000 iterations of losing points.
