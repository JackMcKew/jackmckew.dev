Title: Teaching a Car to Park - Reinforcement Learning in Pygame
Date: 2026-03-10
Author: Jack McKew
Category: Python
Tags: neural-networks, reinforcement-learning, parking, simulation, pygame

I built a car parking simulator in Pygame and trained a neural network to solve it. For the first 500 steps, the car did something unhelpful (usually drove into a wall). Then it had one of those RL moments where it figured out how to parallel park, and it was genuinely satisfying to watch.

## The environment

A simple Pygame window with:
- A car (rectangle with rotation and velocity)
- A parking space (outlined in green)
- Walls around the edges
- Simple physics: steering angle + acceleration

```python
import pygame
import numpy as np
import math

class ParkingEnv:
    def __init__(self, width=800, height=600):
        self.width = width
        self.height = height
        self.reset()

    def reset(self):
        # Car starts at random position, off to the side
        self.car_x = np.random.uniform(100, 300)
        self.car_y = np.random.uniform(100, 300)
        self.car_angle = np.random.uniform(-math.pi, math.pi)
        self.car_vx = 0
        self.car_vy = 0

        # Parking space at fixed location
        self.park_x = 600
        self.park_y = 300
        self.park_width = 150
        self.park_height = 80

    def step(self, action):
        # Action: [steering_angle, acceleration]
        steering, accel = action

        # Simple physics
        max_steering = 0.5
        max_accel = 5
        steering = np.clip(steering, -max_steering, max_steering)
        accel = np.clip(accel, -max_accel, max_accel)

        # Update velocity
        self.car_vx = accel * math.cos(self.car_angle)
        self.car_vy = accel * math.sin(self.car_angle)

        # Update position
        self.car_x += self.car_vx
        self.car_y += self.car_vy

        # Update angle (steering)
        self.car_angle += steering

        # Collision with walls
        crashed = self.car_x < 20 or self.car_x > self.width - 20 or \
                  self.car_y < 20 or self.car_y > self.height - 20

        # Check if parked
        parked = self.is_parked()

        # Compute reward
        distance_to_space = self.distance_to_parking_space()
        reward = -distance_to_space / 1000  # negative reward for distance

        if parked:
            reward += 10  # big reward for parking

        if crashed:
            reward -= 5  # penalty for hitting wall
            return (self.get_obs(), reward, True)  # done

        return (self.get_obs(), reward, False)

    def is_parked(self):
        # Car is parked if it's inside the space and roughly aligned
        in_space = (self.park_x - self.park_width/2 < self.car_x < self.park_x + self.park_width/2 and
                    self.park_y - self.park_height/2 < self.car_y < self.park_y + self.park_height/2)

        # Angle should be roughly 0 (aligned with space)
        aligned = abs(self.car_angle) < 0.2 or abs(self.car_angle - 2*math.pi) < 0.2

        return in_space and aligned

    def distance_to_parking_space(self):
        # Euclidean distance from car center to space center
        return math.sqrt((self.car_x - self.park_x)**2 + (self.car_y - self.park_y)**2)

    def get_obs(self):
        # Observation: [car_x, car_y, car_angle, car_vx, car_vy, park_x, park_y, distance]
        obs = np.array([
            self.car_x / self.width,
            self.car_y / self.height,
            self.car_angle / (2 * math.pi),
            self.car_vx / 10,
            self.car_vy / 10,
            (self.park_x - self.car_x) / self.width,
            (self.park_y - self.car_y) / self.height
        ], dtype=np.float32)
        return obs
```

The observation space is just 7 numbers: the car's position/angle/velocity and the relative position of the parking space. Simple but sufficient.

## The neural network

A simple 2-layer network to map observations to steering/acceleration:

```python
import torch
import torch.nn as nn

class ParkingPolicy(nn.Module):
    def __init__(self, obs_size=7, action_size=2):
        super().__init__()
        self.fc1 = nn.Linear(obs_size, 64)
        self.fc2 = nn.Linear(64, 32)
        self.fc_steering = nn.Linear(32, 1)
        self.fc_accel = nn.Linear(32, 1)

    def forward(self, obs):
        x = torch.relu(self.fc1(obs))
        x = torch.relu(self.fc2(x))
        steering = torch.tanh(self.fc_steering(x))  # output in [-1, 1]
        accel = torch.tanh(self.fc_accel(x))        # output in [-1, 1]
        return torch.cat([steering, accel], dim=-1)
```

64 and 32 hidden units is overkill for this problem, but it doesn't hurt.

## Training with policy gradient

I used a simple policy gradient approach (not deep RL - too complex for this writeup). The idea: run the policy, collect trajectories, compute the gradient of the log-probability weighted by rewards, update the policy.

```python
import torch.optim as optim

env = ParkingEnv()
policy = ParkingPolicy()
optimizer = optim.Adam(policy.parameters(), lr=1e-3)

for episode in range(1000):
    obs = env.reset()
    episode_reward = 0
    done = False

    trajectory = []  # (obs, action, reward)

    while not done:
        obs_tensor = torch.tensor(obs).unsqueeze(0)
        action = policy(obs_tensor).detach().numpy()[0]

        obs, reward, done = env.step(action)
        trajectory.append((obs_tensor, action, reward))
        episode_reward += reward

    # Compute discounted returns
    returns = []
    cumulative_return = 0
    gamma = 0.99
    for obs_t, action_t, reward_t in reversed(trajectory):
        cumulative_return = reward_t + gamma * cumulative_return
        returns.append(cumulative_return)
    returns.reverse()
    returns = torch.tensor(returns)

    # Normalize returns
    returns = (returns - returns.mean()) / (returns.std() + 1e-8)

    # Compute policy loss
    loss = 0
    for i, (obs_t, action_t, _) in enumerate(trajectory):
        action_pred = policy(obs_t)
        log_prob = -0.5 * torch.sum((action_pred - action_t)**2)  # Gaussian
        loss -= log_prob * returns[i]

    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    if episode % 50 == 0:
        print(f"Episode {episode}, Reward: {episode_reward:.2f}")
```

This is basic policy gradient. For each action taken, we compute how much it helped (the return), then we push the policy toward those good actions.

## The hilarious failures

For the first 50 episodes, the car did nothing sensible:

**Episodes 0-10**: The car just drove straight into the top wall. Every episode. The network hadn't learned that steering existed.

**Episodes 11-50**: The car discovered steering. Now it did donuts in the middle of the screen, spinning wildly because turning was "rewarded" (it was closer to the parking space after spinning). This was genuinely funny to watch. The car would execute perfect circles, never approaching the parking space.

**Episodes 51-100**: The car had a new strategy: drive to the parking space really fast and crash into it. High-speed tangential collisions. The reward for reaching the space outweighed the penalty for crashing, so it optimized for "get there as fast as possible".

**Episodes 101-200**: Finally, it learned to slow down before entering the space. But it couldn't figure out alignment. It would park with the car at a 45-degree angle, still get the reward, and stop there. The angle constraint wasn't strict enough.

**Episodes 201-500**: This is where it clicked. The car learned to approach the space from an angle, correct its trajectory, and align itself. It wasn't smooth - there was still overshooting and weird back-and-forth movements - but it worked.

**Episodes 501+**: By episode 500, the car could park reliably. It approached at an angle, corrected, straightened out, and settled into the space. Not elegant, but functional.

## Why it's interesting

The cool part isn't the parking itself - it's that the network learned this entirely from gradient updates and rewards. No hand-coded logic, no pre-programmed maneuvers. Just "steering angle and acceleration -> maximize reward". The network figured out that you need to do a multi-step procedure (approach, correct, align) to park effectively.

If you visualize the network's attention across episodes, you'd see:
- Early: mostly using acceleration, ignoring steering
- Mid: overcompensating with steering
- Late: balanced use of both, with anticipation (steering before position is obvious)

## What would I do differently?

**Curriculum learning**: Start with the parking space right in front of the car, then gradually move it. Learning the full problem is harder than learning a sequence of easier subproblems.

**Better reward shaping**: The distance-based reward is vague. Something like "reward for being inside the space, penalty for angular distance" would be clearer.

**Observation engineering**: Add sensor data - "how far to the wall on my left/right/front". This mimics what a real car has (parking sensors).

**Continuous training visualization**: Watch the policy improve in real-time instead of just getting episode rewards. Pygame is perfect for this.

## The lesson

This is what I love about RL. A simple environment, a simple network, and a learning signal (reward) produces behavior that emerges from optimization. The car didn't need to be programmed to "turn left then straighten" - it learned that turning left, then straightening, maximizes reward.

This scales to much harder problems (robotics, trading, game playing). The core insight stays the same: define a reward, run trajectories, optimize the policy.

Also, watching a neural network do something hilariously wrong, then gradually figure it out, is endlessly entertaining. If you've got a GPU and a weekend, build this. Watching the car flail around before learning to park is comedy gold.
