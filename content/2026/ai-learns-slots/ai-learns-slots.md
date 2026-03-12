Title: AI Learns to Play the Slots
Date: 2026-03-12
Author: Jack McKew
Category: Python
Tags: reinforcement-learning, multi-armed-bandit, slots, exploration, exploitation

The multi-armed bandit problem is where machine learning meets Vegas. You've got a row of slot machines, each with an unknown payout probability. You've got 1,000 spins. Do you keep pulling the one you like, or risk trying something new?

I built a 5-machine simulator and tested three strategies across 500 independent runs. The differences were striking - not just in final score, but in *how* each strategy figured out which machine was best.

## The Setup

Five slot machines with true win probabilities of 0.10, 0.15, 0.30, 0.45, and 0.50. Machine 5 is the best, but you don't know that upfront. Every pull gives you one data point.

The measure of performance is **regret** - the difference between what you earned and what you *would* have earned by always pulling the best machine. Lower is better. A perfect agent with full knowledge would have zero regret.

```python
class BanditEnv:
    def __init__(self, k, true_probs):
        self.machines = [SlotMachine(p) for p in true_probs]
        self.true_probs = np.array(true_probs)
        self.best = np.max(true_probs)
        self.history = []
        self.cumulative_reward = 0

    def pull(self, i):
        r = self.machines[i].pull()
        self.history.append((i, r))
        self.cumulative_reward += r
        return r

    def regret(self):
        return self.best * len(self.history) - self.cumulative_reward
```

## Strategy 1: Epsilon-Greedy

With probability epsilon (0.1), pick randomly. Otherwise, pick whatever has the highest estimated win rate so far.

```python
class EpsilonGreedy:
    def __init__(self, k, epsilon=0.1):
        self.k = k
        self.epsilon = epsilon
        self.estimates = np.zeros(k)
        self.counts = np.zeros(k)

    def choose(self):
        if np.random.random() < self.epsilon:
            return np.random.randint(self.k)
        return int(np.argmax(self.estimates))

    def update(self, i, r):
        self.counts[i] += 1
        self.estimates[i] += (r - self.estimates[i]) / self.counts[i]
```

Epsilon-greedy is dead simple - and that's both its strength and its flaw. It explores uniformly at random. Even after 900 pulls have confirmed machine 1 is terrible, it still gives machine 1 a 2% chance (epsilon/k) on every remaining step.

**Actual result: 54.0 +/- 32.7 regret over 1,000 pulls**

The high standard deviation (32.7) tells you something: epsilon-greedy is inconsistent. Lucky runs where it found the best machine early get low regret. Unlucky runs where exploration kept sending it to bad machines get punished.

Arm pull breakdown after 1,000 pulls (mean across 500 runs):
- Machine 1 (p=0.10): 53 pulls (5.3%)
- Machine 2 (p=0.15): 25 pulls (2.5%)
- Machine 3 (p=0.30): 47 pulls (4.7%)
- Machine 4 (p=0.45): 303 pulls (30.3%)
- Machine 5 (p=0.50): **572 pulls (57.2%)**

It identified machine 5 as best - but wasted roughly 130 pulls on confirmed losers.

## Strategy 2: UCB (Upper Confidence Bound)

UCB says: pick the machine with the highest *upper* confidence bound on its win rate. Machines you have pulled fewer times get an exploration bonus proportional to uncertainty.

```python
class UCB:
    def __init__(self, k, c=1.0):
        self.k = k
        self.c = c
        self.estimates = np.zeros(k)
        self.counts = np.zeros(k, dtype=float)
        self.t = 0

    def choose(self):
        for i in range(self.k):
            if self.counts[i] == 0:
                return i  # pull every machine at least once
        ucbs = self.estimates + self.c * np.sqrt(np.log(self.t + 1) / self.counts)
        return int(np.argmax(ucbs))
```

The `sqrt(log(t) / count)` term is the key. It grows slowly with total pulls but shrinks fast as you pull a specific machine. The more you know about a machine, the less exploration bonus it gets. No magic epsilon constant - the bonus is derived from information theory.

**Actual result: 50.7 +/- 17.7 regret**

The lower standard deviation (17.7 vs 32.7) is the real story. UCB is more *consistent* than epsilon-greedy. It wastes less time on bad arms once it has sampled them enough.

Arm pull breakdown:
- Machine 1 (p=0.10): 27 pulls
- Machine 2 (p=0.15): 34 pulls
- Machine 3 (p=0.30): 74 pulls
- Machine 4 (p=0.45): 281 pulls
- Machine 5 (p=0.50): **585 pulls (58.5%)**

UCB gives each machine more early pulls to reduce uncertainty, then rapidly deprioritises bad arms once it has enough evidence. The variance reduction vs epsilon-greedy is consistent and reliable.

## Strategy 3: Thompson Sampling

Thompson sampling takes a Bayesian approach. For each machine, maintain a Beta distribution over its unknown win probability. Sample from each distribution. Pull the machine with the highest sample.

```python
class ThompsonSampling:
    def __init__(self, k):
        self.k = k
        self.alpha = np.ones(k)   # wins + 1
        self.beta  = np.ones(k)   # losses + 1

    def choose(self):
        samples = np.array([
            np.random.beta(self.alpha[i], self.beta[i])
            for i in range(self.k)
        ])
        return int(np.argmax(samples))

    def update(self, i, r):
        if r == 1:
            self.alpha[i] += 1
        else:
            self.beta[i] += 1
```

The Beta distribution is the natural prior for a Bernoulli (win/lose) process. Beta(1,1) is uniform - total ignorance. Beta(50,50) is tightly peaked around 0.5. As you observe wins and losses, the distribution sharpens. When machine 5's distribution is Beta(51,50), a sample of 0.52 will usually beat any sample from machine 1's Beta(8,70). Exploration happens automatically, proportional to genuine uncertainty.

**Actual result: 28.6 +/- 19.7 regret**

Nearly half the regret of epsilon-greedy. Thompson achieved this by pulling machine 5 for **71.1% of all pulls** - the most focused allocation of the three.

Arm pull breakdown:
- Machine 1 (p=0.10): 12 pulls
- Machine 2 (p=0.15): 15 pulls
- Machine 3 (p=0.30): 35 pulls
- Machine 4 (p=0.45): 227 pulls
- Machine 5 (p=0.50): **711 pulls (71.1%)**

No epsilon. No confidence constant. The Bayesian update handles everything.

## The Regret Gap

Summary across 500 runs, 1,000 pulls each:

| Strategy | Mean regret | Std dev | Best arm % |
|---|---|---|---|
| Epsilon-greedy (e=0.1) | 54.0 | 32.7 | 57.2% |
| UCB (c=1.0) | 50.7 | 17.7 | 58.5% |
| Thompson sampling | **28.6** | 19.7 | **71.1%** |

Thompson's mean is 47% lower than epsilon-greedy. UCB's consistency (std 17.7) is better than Thompson's (19.7) - UCB rarely has catastrophic runs. Thompson occasionally gets unlucky during early exploration and pays for it over the full run. Both UCB and Thompson are vastly better than random selection, which would give ~250 regret on this setup.

The exploration curves also tell a story. Epsilon-greedy's regret grows nearly linearly early - it's spending 10% of all time on random machines with no regard for what it already knows. UCB and Thompson both show steep early regret (while sampling everything) followed by a slower, flatter curve as they lock onto machine 5.

## Why Casinos Win

You are an epsilon-greedy player. Your epsilon is hope, novelty, and the sunk cost of the previous pull. The casino has tuned its machines so the "best" one still gives the house a 2-5% edge - meaning your optimal strategy still loses.

You can't run 500 simulations per visit. You have maybe 50-100 pulls before budget or patience runs out. In that regime, even Thompson sampling doesn't fully converge. The house wins because you run out of budget before you accumulate enough data to reliably identify the best machine.

The multi-armed bandit appears everywhere: A/B testing, ad serving, clinical trials, recommendation systems. Thompson sampling is used in production at Netflix, Spotify, and most major ad networks. When the cost of exploration is real - money, user experience, patient welfare - the difference between 54 and 28 regret compounds quickly at scale.

![Multi-armed bandit: cumulative regret, distribution, and arm selection across 500 runs]({static}images/bandit_comparison.png)
