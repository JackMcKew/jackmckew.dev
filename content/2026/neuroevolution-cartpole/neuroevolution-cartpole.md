Title: Evolution Finds Perfect CartPole Balance in 10 Generations
Date: 2026-03-12
Author: Jack McKew
Category: Python
Tags: reinforcement-learning, neuroevolution, genetic-algorithm, cartpole, evolutionary-computation

DQN learns by computing gradients. It adjusts weights in the direction that reduces loss. It requires a differentiable loss function, a carefully tuned learning rate, and experience replay to stabilise training.

A genetic algorithm ignores all of that. No gradients, no learning rate, no replay buffer. Just: *try things, keep what works, breed the rest*.

On CartPole, neuroevolution found a **perfect** policy in 10 generations - before DQN would even finish filling its replay buffer.

## The Setup

CartPole: a pole balanced on a movable cart. Push the cart left or right. Keep the pole from falling over. The episode ends when the pole tilts beyond 15 degrees, the cart goes out of bounds, or 1,000 steps elapse.

The network: tiny MLP (4 inputs → 32 hidden → 2 outputs, tanh activation). 226 total weights.

**Genetic algorithm:**

```python
POP_SIZE  = 80      # individuals per generation
N_GEN     = 150     # generations to run
ELITE_K   = 20      # top-20 survive unchanged
MUTATION_SIGMA = 0.08  # Gaussian noise added per weight
CROSSOVER_P    = 0.5   # per-weight chance to take from parent 1
```

Each generation:
1. Evaluate all 80 individuals (3 CartPole trials, take average)
2. Keep top 20 unchanged (elitism)
3. Fill remaining 60 slots via tournament selection + uniform crossover + Gaussian mutation
4. Repeat

No gradient. No loss function. No optimizer. Just: survive longer = reproduce more.

## What Happened

| Generation | Best fitness | Avg fitness | Perfect runs |
|-----------|-------------|-------------|--------------|
| 1 (random init) | ~150 | ~40 | 0% |
| 10 | **1000** | 166 | elite: 100% |
| 50 | 1000 | 703 | - |
| 100 | 1000 | 908 | - |
| 150 | 1000 | 936 | - |

**Generation 10: perfect score.** One individual in the population learned to balance the pole for the full 1,000 steps. From random initialisation.

Final eval (500 runs, single trial each): **avg 1000 steps, 100% perfect.**

Random policy baseline: **24.9 avg steps** (pole falls almost immediately). The evolved policy is **40x better** on the same metric.

The evolved policy doesn't just pass the benchmark - it saturates it. Every single evaluation run hits the 1,000 step ceiling.

## Why It Converges So Fast

CartPole is a problem with **low-dimensional structure**. The optimal policy is roughly: "push right when the pole leans right, push left when it leans left, with corrections for velocity." A 4→32→2 network with 226 weights can easily express this. In a random population of 80 networks, at least one will accidentally implement this rule reasonably well - and that's the seed that evolution amplifies.

Compare to DQN: DQN needs to:
1. Fill its replay buffer (needs ~10K experiences first)
2. Compute Q-values for future states
3. Learn the Bellman equation through temporal difference updates
4. Deal with moving targets (the Q-network updates change the targets)

For CartPole, this machinery is overkill. The optimal policy is simple; gradient descent just takes a roundabout path to find it.

## The Population Diversity Plot

After the best individual hits 1000 steps at generation 10, the *average* fitness takes 140 more generations to reach 936. This is the population catching up to the elite. The diversity gap (best - avg) remains high because mutation keeps introducing suboptimal variants.

This is a feature, not a bug. High diversity = exploration. If the population homogenised at generation 10, it would lose the ability to adapt to problems where "best" changes during training.

## Genetic Algorithm vs DQN: When to Use Which

| | Neuroevolution | DQN |
|---|---|---|
| **Gradient required** | No | Yes |
| **Good when** | Simple, low-dim policy | Complex, high-dim state |
| **Sample efficiency** | Low (many parallel evals) | High (reuses experience) |
| **Parallelisable** | Trivially (eval each individual) | Harder (correlated samples) |
| **Noisy fitness** | Handles naturally | Handled via replay buffer |
| **State representation** | Learned implicitly | Learned explicitly via Q-values |

For CartPole: neuroevolution is faster. For Atari games with image inputs: DQN wins by a large margin - the problem is too high-dimensional for random weight perturbations to find good policies.

The sweet spot for neuroevolution is **fast, parallelisable evaluation + low-dimensional policy space**. Robot locomotion simulators, hyperparameter search, trading strategies with discrete actions. Anywhere you can run thousands of evaluations in parallel.

## The Code

```python
def crossover(w1, w2):
    mask = np.random.rand(len(w1)) < CROSSOVER_P
    return np.where(mask, w1, w2)

def mutate(w, sigma=MUTATION_SIGMA):
    return w + np.random.randn(len(w)) * sigma

for gen in range(N_GEN):
    fitnesses = [evaluate_net(set_weights(net, w)) for w in population]

    order = np.argsort(fitnesses)[::-1]
    new_pop = [population[i] for i in order[:ELITE_K]]

    while len(new_pop) < POP_SIZE:
        p1 = tournament_select(fitnesses)
        p2 = tournament_select(fitnesses)
        child = mutate(crossover(population[p1], population[p2]))
        new_pop.append(child)

    population = new_pop
```

The full training loop is 25 lines. There's no optimizer, no loss function, no target network. Just crossover, mutation, and survival of the fittest.

For CartPole - and many problems like it - this is enough.

![Training curves and population convergence]({static}images/training_curves.png)
