using Unity.MLAgents;
using Unity.MLAgents.Actuators;
using Unity.MLAgents.Sensors;
using UnityEngine;

public class RewardAgent : Agent
{
    public override void OnActionReceived(ActionBuffers actions)
    {
        // // Calculate movement direction
        Vector3 movementDirection = new Vector3(
            actions.ContinuousActions[0],
            0f,
            actions.ContinuousActions[1]
        ).normalized;

        // If there is movement input, apply force to move the sphere
        if (movementDirection != Vector3.zero)
        {
            // Rotate the movement direction relative to the global coordinate system
            movementDirection =
                Quaternion.Euler(0, Camera.main.transform.eulerAngles.y, 0) * movementDirection;

            // Apply force to move the sphere
            agentRigidBody.AddForce(movementDirection * speed, ForceMode.Acceleration);

            // Rotate the sphere to face the movement direction
            // transform.rotation = Quaternion.LookRotation(movementDirection);
        }

        AddReward(-1 * (StepCount / 1000));
    }

    public override void Heuristic(in ActionBuffers actionsOut)
    {
        ActionSegment<float> continuousActions = actionsOut.ContinuousActions;
        continuousActions[0] = Input.GetAxisRaw("Horizontal");
        continuousActions[1] = Input.GetAxisRaw("Vertical");
    }

    [SerializeField]
    private Material winMaterial;

    [SerializeField]
    private Material loseMaterial;

    [SerializeField]
    private MeshRenderer floorMeshRenderer;

    [SerializeField]
    private Transform rewardTransform;

    public override void CollectObservations(VectorSensor sensor)
    {
        sensor.AddObservation(transform.localPosition);
        sensor.AddObservation(rewardTransform.localPosition);
        sensor.AddObservation(agentRigidBody.velocity);
        sensor.AddObservation(agentRigidBody.angularVelocity);
    }

    public float speed = 10f; // Speed of sphere movement
    private Rigidbody agentRigidBody;

    void Start()
    {
        // Get the Rigidbody component
        agentRigidBody = GetComponent<Rigidbody>();
        ResetRewardPosition();
    }

    void ResetAgentPosition()
    {
        // Reset the force on the object
        agentRigidBody.velocity = Vector3.zero;
        agentRigidBody.angularVelocity = Vector3.zero;
        transform.localPosition = new Vector3(1, rewardTransform.transform.localPosition.y, 1);
    }

    // These are recorded in localPosition
    private Vector3 minBounds = new Vector3(-0.5f, 0f, -3f);
    private Vector3 maxBounds = new Vector3(8f, 0f, 5.5f);

    private float minDistance = 1f;

    private Vector3 GenerateRandomPosition()
    {
        return new Vector3(
            Random.Range(minBounds.x, maxBounds.x),
            0f,
            Random.Range(minBounds.z, maxBounds.z)
        );
    }

    private bool IsPositionValid(Vector3 position, Vector3 referencePosition)
    {
        return Vector3.Distance(position, referencePosition) >= minDistance;
    }

    public Vector3 GetRandomPosition(Vector3 referencePosition)
    {
        int maxAttempts = 100;
        int attempts = 0;

        do
        {
            Vector3 randomPosition = GenerateRandomPosition();
            if (IsPositionValid(randomPosition, referencePosition))
            {
                return randomPosition;
            }
            attempts++;
        } while (attempts < maxAttempts);

        Debug.LogWarning(
            "Failed to find a valid random position within bounds after "
                + maxAttempts
                + " attempts."
        );
        return Vector3.zero; // Return zero if failed to find a valid position
    }

    void ResetRewardPosition()
    {
        Vector3 randomPosition = GetRandomPosition(transform.localPosition);
        randomPosition.y = transform.localPosition.y;
        rewardTransform.localPosition = randomPosition;
    }

    public float maxBound = 3f; // Maximum bounds for random position

    private float episodeStartTime;
    private float timePenaltyMultiplier = 0.1f; // Adjust this multiplier as needed

    public override void OnEpisodeBegin()
    {
        // Reset any necessary variables at the beginning of each episode
        episodeStartTime = Time.time;
    }

    // Custom method to calculate scaled rewards based on completion time
    private float CalculateScaledReward(float originalReward)
    {
        // We want to discourage slower completions
        float episodeDuration = Time.time - episodeStartTime;
        float scaledReward = originalReward - (episodeDuration * timePenaltyMultiplier);
        return scaledReward;
    }

    void OnCollisionEnter(Collision collision)
    {
        if (collision.gameObject.name.Contains("Reward"))
        {
            AddReward(10f);
            ResetRewardPosition();
            floorMeshRenderer.material = winMaterial;
            EndEpisode();
        }
        if (collision.gameObject.name.Contains("Wall"))
        {
            AddReward(-1f);
            floorMeshRenderer.material = loseMaterial;
            ResetAgentPosition();
            EndEpisode();
        }
    }
}
