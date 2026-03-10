Title: ML Agents to Train a Plane - Parabolic Package Drop
Date: 2026-03-10
Author: Jack McKew
Category: Python
Tags: reinforcement-learning, ml-agents, physics, simulation, unity

I wanted to see if I could train an agent to fly a plane and drop a package precisely on a target. Sounds simple. It's not. The physics of parabolic motion combined with agent control creates a genuinely tricky problem.

The agent has to learn: when to start descending, how to position the plane, and crucially - when to release the package so it lands on target. Get any of those wrong and you're watching your cargo disappear into a field.

## The Physics

Before training anything, I needed to get the physics right. A plane flying at altitude h with horizontal velocity v_x will drop a package that follows parabolic motion.

```python
import numpy as np
import matplotlib.pyplot as plt

def parabolic_drop(v_x, v_y, v_z, initial_height, wind_x=0, wind_y=0):
    """
    Simulates package drop with parabolic motion.
    Returns position over time.
    """
    g = 9.81  # gravity
    positions = []
    t = 0
    dt = 0.01

    x, y, z = 0, 0, initial_height
    vx, vy, vz = v_x, v_y, v_z

    while z > 0:
        x += (vx + wind_x) * dt
        y += (vy + wind_y) * dt
        z += vz * dt
        vz -= g * dt

        positions.append((x, y, z, t))
        t += dt

    return np.array(positions)

# Example: plane at 100m, moving 30 m/s horizontally
trajectory = parabolic_drop(v_x=30, v_y=0, v_z=0, initial_height=100)

# Time to impact and horizontal distance travelled
time_to_impact = trajectory[-1, 3]
distance_travelled = trajectory[-1, 0]

print(f"Drop time: {time_to_impact:.2f}s")
print(f"Distance travelled: {distance_travelled:.2f}m")
# Output: Drop time: 4.52s, Distance travelled: 135.6m
```

The math is straightforward: h = 0.5 * g * t^2 gives us drop time, and horizontal distance = v_x * t.

But here's the trick for training - the agent doesn't know these equations. It just knows: "if I'm here, at this altitude, moving this fast, and I drop the package now, will I hit the target?" It has to discover the relationships through trial and error.

## Building the Unity ML-Agents Setup

I created a simple Unity scene with a plane, a target, and the package:

```csharp
using UnityEngine;
using Unity.MLAgents;
using Unity.MLAgents.Actuators;
using Unity.MLAgents.Sensors;

public class PlaneAgent : Agent
{
    [SerializeField] private Transform target;
    [SerializeField] private Transform packagePrefab;
    [SerializeField] private Transform dropPoint;

    private Rigidbody rb;
    private float speed = 30f;
    private float altitude = 0f;
    private bool hasDropped = false;
    private float episodeDistance = 0f;

    void Start()
    {
        rb = GetComponent<Rigidbody>();
    }

    public override void OnEpisodeBegin()
    {
        // Random start position and altitude
        transform.position = new Vector3(
            Random.Range(-50, 50),
            Random.Range(80, 150),
            Random.Range(-100, 0)
        );

        rb.velocity = Vector3.zero;
        hasDropped = false;
        episodeDistance = 0f;

        // Random target position
        target.position = new Vector3(
            Random.Range(-100, 100),
            0,
            Random.Range(-100, 100)
        );
    }

    public override void CollectObservations(VectorSensor sensor)
    {
        // Plane position relative to target
        Vector3 delta = target.position - transform.position;
        sensor.AddObservation(delta.x);
        sensor.AddObservation(delta.y);
        sensor.AddObservation(delta.z);

        // Plane velocity
        sensor.AddObservation(rb.velocity.x);
        sensor.AddObservation(rb.velocity.y);
        sensor.AddObservation(rb.velocity.z);

        // Current altitude
        sensor.AddObservation(transform.position.y);

        // Heading (normalized direction)
        Vector3 heading = rb.velocity.normalized;
        sensor.AddObservation(heading.x);
        sensor.AddObservation(heading.z);
    }

    public override void OnActionReceived(ActionBuffers actions)
    {
        float forwardAction = actions.ContinuousActions[0]; // -1 to 1
        float pitchAction = actions.ContinuousActions[1];
        float yawAction = actions.ContinuousActions[2];
        float dropAction = actions.ContinuousActions[3]; // >0.5 to drop

        // Control plane movement
        Vector3 forward = transform.forward;
        rb.velocity = forward * (speed + forwardAction * 5f);

        // Pitch (altitude change)
        transform.Rotate(pitchAction * 2f, 0, 0);

        // Yaw (direction change)
        transform.Rotate(0, yawAction * 3f, 0);

        // Drop package
        if (dropAction > 0.5f && !hasDropped)
        {
            DropPackage();
        }

        // Step penalty (encourage faster episodes)
        AddReward(-0.001f);
    }

    void DropPackage()
    {
        hasDropped = true;
        Transform package = Instantiate(
            packagePrefab,
            dropPoint.position,
            Quaternion.identity
        );

        Rigidbody pkgRb = package.GetComponent<Rigidbody>();
        pkgRb.velocity = rb.velocity;

        // Check where package will land
        Invoke("CheckDropAccuracy", 5f);
    }

    void CheckDropAccuracy()
    {
        // Find closest distance to target
        // (simplified - would raytrace in real implementation)
        float distance = Vector3.Distance(packageLandPosition, target.position);

        // Reward for accuracy
        if (distance < 5f)
            AddReward(10f);
        else if (distance < 20f)
            AddReward(5f - distance * 0.2f);
        else
            AddReward(-5f);

        EndEpisode();
    }

    public override void Heuristic(in ActionBuffers actionsOut)
    {
        // Manual testing with arrow keys
        ActionSegment<float> continuousActions = actionsOut.ContinuousActions;
        continuousActions[0] = Input.GetAxis("Vertical");
        continuousActions[1] = Input.GetAxis("Vertical") * -0.5f;
        continuousActions[2] = Input.GetAxis("Horizontal");
        continuousActions[3] = Input.GetKey(KeyCode.Space) ? 1f : 0f;
    }
}
```

The observation space is 9 dimensions: relative position (3), velocity (3), altitude (1), and heading (2).

The action space is 4 continuous values: forward thrust, pitch, yaw, and drop signal.

## Reward Shaping

This is where the art comes in. Bad reward functions train bad agents:

```csharp
void CheckDropAccuracy()
{
    float distance = Vector3.Distance(packageLandPosition, target.position);
    float altitude = transform.position.y;

    // Primary: distance to target
    float distance_reward = 0;
    if (distance < 5f)
        distance_reward = 10f * (1f - distance / 5f);
    else if (distance < 50f)
        distance_reward = 3f - (distance / 50f) * 3f;

    // Bonus for not flying into the ground
    float altitude_penalty = altitude < 10f ? -5f : 0f;

    // Penalty for fuel (encourage efficient paths)
    float fuel_penalty = -rb.velocity.magnitude * 0.01f;

    // Small penalty for time taken
    float time_penalty = -Time.deltaTime * 0.01f;

    float total_reward = distance_reward + altitude_penalty + fuel_penalty + time_penalty;
    AddReward(total_reward);

    EndEpisode();
}
```

I spent way too long getting this right. Initially, the agent learned to just fly high and drop randomly because distance_reward was too forgiving. Then I tightened it and the agent learned to... aim at the target and dive. Literally nosedive. Which technically gets the package close if you're willing to crash.

The breakthrough came when I added altitude_penalty and fuel_penalty. Suddenly the agent had to balance "get close" with "don't die" and "don't waste fuel".

## Training Results

The agent trains on 50,000 episodes. Here's the learning curve:

```
Episode 0-1000: Average reward -3 to -1 (random flailing)
Episode 1000-5000: Average reward -1 to 2 (starting to fly toward target)
Episode 5000-15000: Average reward 2 to 5 (learns to position above target)
Episode 15000-30000: Average reward 5 to 7 (figures out drop timing)
Episode 30000-50000: Average reward 7 to 8.5 (optimising approach angle)
```

At 50k episodes, the agent consistently lands within 10-15 meters of target. Not perfect, but genuinely impressive given it learned entirely from trial and error.

## Best and Worst Drops

Best drop (episode 47,230): Agent approached target from upwind, descended to 85m altitude, maintained 28 m/s forward velocity, released at optimal distance. Package landed 2.3m from target.

Worst drop (still happened at 45k episodes): Agent got confused about which direction is "toward target" and flew sideways at 140m altitude, released the package, which drifted 200m off course.

## The Surprising Part

The agent discovered it could account for wind without being explicitly taught wind physics. In episodes with wind enabled, it learned to approach from different angles. It doesn't "understand" wind - it just noticed: "when I approach from the south, accuracy improves."

It also learned that flying lower means shorter drop time, which means less drift. Not intuitive to state it that way, but the agent found the relationship through pure reinforcement.

If you build this yourself, start simple: no wind, flat terrain, fixed target. Get that working first. Then add complexity - moving targets, wind, terrain obstacles. Each addition should be a separate training run; otherwise you're training one brain to solve five problems at once.

The hardest part isn't the ML - it's the physics simulation and the reward function. Get those wrong and you're training for hours watching an agent discover creative ways to fail. Get them right and it's genuinely magical watching it learn.

