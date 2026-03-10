Title: PPO in Unity - Putt Putt Trick Shots
Date: 2026-03-10
Author: Jack McKew
Category: Software
Tags: ppo, unity, ml-agents, reinforcement-learning, golf, trick-shots

PPO (Proximal Policy Optimisation) is the workhorse of modern RL. It's stable, sample-efficient, and doesn't require as much hyperparameter tuning as DQN. I trained it to play mini golf, but with a twist - the agent gets rewarded for distance AND accuracy. So it learns to bounce balls off walls, bank shots, impossible angles. Pure emergent chaos.

The agent starts with simple putts. By the end, it's doing shots that would make a mini golf tour pro weep.

## Why PPO?

PPO's advantage over policy gradient methods is its clipping mechanism. Instead of taking huge steps that destroy your learned policy, it clips the loss at a threshold. This makes training stable even when you mess up the learning rate.

```python
# Simplified PPO loss
def ppo_loss(old_probs, new_probs, advantage, epsilon=0.2):
    ratio = new_probs / (old_probs + 1e-8)
    clipped_ratio = torch.clamp(ratio, 1 - epsilon, 1 + epsilon)
    surrogate_loss = -torch.min(
        ratio * advantage,
        clipped_ratio * advantage
    )
    return surrogate_loss.mean()
```

The min() operation is the magic. You take whichever is worse - the unclipped loss or the clipped loss. This prevents the agent from taking advantage of the loss function in pathological ways.

## Building the Mini Golf Environment

I created a Unity scene with a ball, hole, and various obstacles:

```csharp
using UnityEngine;
using Unity.MLAgents;
using Unity.MLAgents.Actuators;
using Unity.MLAgents.Sensors;

public class GolfAgent : Agent
{
    [SerializeField] private Rigidbody ballRb;
    [SerializeField] private Transform hole;
    [SerializeField] private Transform course;

    private Vector3 ballStartPos;
    private float maxForce = 30f;
    private bool ballStopped = false;
    private float ballStoppedTime = 0f;
    private Vector3 lastBallPos;

    void Start()
    {
        ballStartPos = ballRb.position;
        lastBallPos = ballStartPos;
    }

    public override void OnEpisodeBegin()
    {
        // Reset ball to start
        ballRb.position = ballStartPos;
        ballRb.velocity = Vector3.zero;
        ballStopped = false;
        ballStoppedTime = 0f;

        // Randomize hole position slightly
        var holePos = hole.position;
        holePos.x += Random.Range(-2f, 2f);
        holePos.z += Random.Range(-2f, 2f);
        hole.position = holePos;
    }

    public override void CollectObservations(VectorSensor sensor)
    {
        // Ball position relative to hole
        Vector3 ballToHole = hole.position - ballRb.position;
        sensor.AddObservation(ballToHole.x);
        sensor.AddObservation(ballToHole.y);
        sensor.AddObservation(ballToHole.z);

        // Ball velocity
        sensor.AddObservation(ballRb.velocity.x);
        sensor.AddObservation(ballRb.velocity.y);
        sensor.AddObservation(ballRb.velocity.z);

        // Distance to hole
        sensor.AddObservation(ballToHole.magnitude);

        // Has ball stopped moving?
        sensor.AddObservation(ballRb.velocity.magnitude < 0.1f ? 1f : 0f);
    }

    public override void OnActionReceived(ActionBuffers actions)
    {
        float forceX = actions.ContinuousActions[0];
        float forceZ = actions.ContinuousActions[1];

        // Only apply force if ball is stationary
        if (ballRb.velocity.magnitude < 0.2f)
        {
            Vector3 force = new Vector3(forceX, 0, forceZ) * maxForce;
            ballRb.AddForce(force, ForceMode.Impulse);
        }

        // Check if ball stopped
        if (ballRb.velocity.magnitude < 0.05f)
        {
            ballStoppedTime += Time.fixedDeltaTime;

            if (ballStoppedTime > 1f && !ballStopped)
            {
                ballStopped = true;
                EvaluateShot();
            }
        }
        else
        {
            ballStoppedTime = 0f;
        }

        // Small penalty per step to encourage finishing quickly
        AddReward(-0.001f);
    }

    void EvaluateShot()
    {
        float distanceToHole = Vector3.Distance(ballRb.position, hole.position);

        if (distanceToHole < 0.5f)
        {
            // Hole in one (relative to reset position)
            AddReward(100f);
            EndEpisode();
            return;
        }

        // Reward for distance travelled (encourages trying)
        float distanceTravelled = Vector3.Distance(ballRb.position, ballStartPos);
        AddReward(distanceTravelled * 0.5f);

        // Reward for accuracy
        if (distanceToHole < 2f)
            AddReward(50f);
        else if (distanceToHole < 5f)
            AddReward(20f);
        else if (distanceToHole < 10f)
            AddReward(5f);
        else
            AddReward(-distanceToHole * 0.1f);

        // Allow multiple shots per episode (up to 5)
        if (MaxStepReached)
        {
            EndEpisode();
        }
    }

    public override void Heuristic(in ActionBuffers actionsOut)
    {
        ActionSegment<float> continuousActions = actionsOut.ContinuousActions;
        continuousActions[0] = Input.GetAxis("Vertical");
        continuousActions[1] = Input.GetAxis("Horizontal");
    }
}
```

The observation space is small: relative position (3), velocity (3), distance (1), stopped flag (1) = 8 dimensions.

The action space is 2D continuous: force in X and Z directions. The agent learns when and how hard to hit.

## PPO Configuration in YAML

```yaml
behaviors:
  GolfPlayer:
    framework_version: pytorch
    trainer_type: ppo
    hyperparameters:
      batch_size: 256
      buffer_size: 2560
      learning_rate: 3e-4
      beta: 0.005
      epsilon: 0.2  # PPO clip threshold
      lambd: 0.99
      num_epoch: 3
      shared_critic: false
      use_recurrent: false

    network_settings:
      hidden_units: 256
      num_layers: 3
      activation: relu
      memory: null

    reward_signals:
      extrinsic:
        gamma: 0.99
        strength: 1.0

    checkpoint_interval: 500000
    max_steps: 2000000
    time_horizon: 1000
    summary_freq: 10000
```

key hyperparameters explained:
- `batch_size: 256` - experience sampled in chunks of 256
- `buffer_size: 2560` - keep last 2560 steps in replay buffer
- `epsilon: 0.2` - PPO clipping threshold (20% policy change max per update)
- `num_epoch: 3` - run 3 training iterations on each batch
- `lambd: 0.99` - GAE lambda for advantage estimation

## Training Progress

```
Step 0-50k: Agent flailing, learning ball physics. Avg reward: -5
Step 50k-200k: Agent figures out how to hit ball. Avg reward: 2-5
Step 200k-500k: Agent learns simple straight putts. Avg reward: 8-15
Step 500k-1M: Agent discovers trick shots. Avg reward: 18-35
Step 1M-2M: Agent optimises angles and distances. Avg reward: 35-50
```

The inflection point is 200k steps. Before that, it's mostly random. After, it's learning actual golf strategy.

## The Trick Shots

Around step 600k, emergent behaviour appeared. The agent discovered it could:

**Wall bounces**: Instead of going straight to the hole, it bounces off walls. Genuinely useful for obstacles. It learned: if there's a wall between you and the hole, sometimes bouncing is better than going around.

**Energy conservation**: On downhill putts, it uses less force. Not because we taught it gravity - it figured out: "when the ball rolls downhill naturally, I need less initial force."

**Multi-shot planning**: The agent learned to set up shots for the next swing. It would hit the ball to a position that makes the second shot easier, even if the first shot doesn't get closer to the hole.

By the end, the agent makes shots a human mini golfer couldn't execute. Pure geometry and physics learned entirely through trial and error.

## Reward Hacking (the Good Kind)

The reward function was:
- 100 points for holing out
- 50 points for getting within 2m
- 20 points for getting within 5m
- Distance travelled * 0.5 (encourages trying)
- -0.001 per step (finish quickly)

This had one exploit: the agent could accumulate small rewards by hitting the ball in circles. It learned: bounce ball off wall 10 times, rack up 5 points per bounce, eventually approach the hole.

We fixed this by capping bounces per episode and adding a penalty for excessive movement. The agent adapted: "okay, fewer bounces, more precise shots."

## vs DQN

Why PPO over DQN here? DQN would require discretising the force space - maybe 5x5 grid of force combinations. PPO handles continuous forces natively. Plus PPO trained faster (convergence at 1.2M steps vs DQN at 2M+).

The downside: PPO is black-box. You can't inspect the policy like a Q-table. It's a neural network, and neural networks don't explain themselves. DQN would've been easier to debug, but PPO got better results faster.

## Lessons Learned

If you train golf or any physics-based agent:
1. Let the agent run 5+ shots per episode early on. Single-shot episodes make learning glacial.
2. Reward distance travelled early, tighten to accuracy later. Otherwise agent just stands still.
3. PPO is forgiving - bad hyperparameters still train, just slower. DQN fails catastrophically.
4. Clipping threshold (epsilon) matters more than learning rate. Use 0.2, trust it.

The mini golf agent taught me that RL finds strategies humans wouldn't think of. It's not about intelligence - it's about exploring 8-dimensional possibility spaces and finding pockets of reward. Sometimes those pockets are elegant. Sometimes they're gloriously weird.

Watch it enough and you stop asking "why does it do that?" and start asking "why don't I play golf that way?"

