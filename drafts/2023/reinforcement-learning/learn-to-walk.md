using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Unity.MLAgents;
using Unity.MLAgents.Sensors;

public class LimbAgent : Agent
{
    public GameObject target;
    public GameObject limbPrefab;
    public int maxLimbCount = 5;
    public float limbGrowRate = 0.5f;
    public float limbExtendRate = 0.5f;
    public float moveSpeed = 5.0f;
    
    private List<GameObject> limbs = new List<GameObject>();
    private Vector3 startPosition;
    private Rigidbody rb;
    private bool canGrow = true;
    private bool canExtend = true;

    public override void Initialize()
    {
        startPosition = transform.position;
        rb = GetComponent<Rigidbody>();
    }

    public override void OnEpisodeBegin()
    {
        // Reset agent position
        transform.position = startPosition;

        // Remove all limbs
        foreach (GameObject limb in limbs)
        {
            Destroy(limb);
        }
        limbs.Clear();

        // Create initial limb
        GameObject limb = Instantiate(limbPrefab, transform.position + Vector3.up, Quaternion.identity);
        limb.transform.parent = transform;
        limbs.Add(limb);

        // Reset growth and extension abilities
        canGrow = true;
        canExtend = true;

        // Reset target position
        target.transform.position = new Vector3(Random.Range(-5.0f, 5.0f), 0.5f, Random.Range(-5.0f, 5.0f));
    }

    public override void CollectObservations(VectorSensor sensor)
    {
        // Agent position
        sensor.AddObservation(transform.position);

        // Target position
        sensor.AddObservation(target.transform.position);

        // Limb count
        sensor.AddObservation(limbs.Count);

        // Growth and extension abilities
        sensor.AddObservation(canGrow);
        sensor.AddObservation(canExtend);
    }

    public override void OnActionReceived(float[] vectorAction)
    {
        // Move agent
        Vector3 move = new Vector3(vectorAction[0], 0, vectorAction[1]);
        rb.AddForce(move * moveSpeed);

        // Grow or extend limb
        if (vectorAction[2] > 0.5f && canGrow && limbs.Count < maxLimbCount)
        {
            GameObject limb = Instantiate(limbPrefab, transform.position + Vector3.up * limbs.Count, Quaternion.identity);
            limb.transform.parent = transform;
            limbs.Add(limb);
            canGrow = false;
            AddReward(0.1f);
        }
        else if (vectorAction[3] > 0.5f && canExtend && limbs.Count > 0)
        {
            GameObject limb = limbs[limbs.Count - 1];
            limb.transform.localScale += new Vector3(0, limbExtendRate, 0);
            canExtend = false;
            AddReward(0.1f);
        }
    }

    public override void Heuristic(float[] actionsOut)
    {
        // Move agent
        actionsOut[0] = Input.GetAxis("Horizontal");
        actionsOut[1] = Input.GetAxis("Vertical");

        // Grow or extend limb
        actionsOut[2] = Input.GetKey(KeyCode.Space) ? 1.0f : 0.0f;
        actionsOut[3] = Input.GetKey(KeyCode.LeftShift) ? 1.0f : 0.0f;
    }

    private void OnTriggerEnter(Collider other)
    {
        // Check if collided with target
        if (other.gameObject.CompareTag("Target"))
        {
            SetReward(1.0f);
            EndEpisode();
        }
        // Check if collided with obstacle
        else if (other.gameObject.CompareTag("Obstacle"))
        {
            SetReward(-1.0f);
            EndEpisode();
        }
    }

    private void OnTriggerExit(Collider other)
    {
        // Reset growth and extension abilities when exiting obstacle
        if (other.gameObject.CompareTag("Obstacle"))
        {
            canGrow = true;
            canExtend = true;
        }
    }
}


In this program, we first define several public variables that can be set in the Unity editor. These include the target game object, a prefab for the limb, the maximum number of limbs allowed, the growth rate of the limbs, the extension rate of the limbs, and the speed at which the agent moves.

We then define several private variables that will be used in the program. These include a list of all the limbs, the starting position of the agent, a reference to the agent's rigidbody, and two boolean variables that represent whether the agent can currently grow or extend a limb.

In the Initialize method, we set the starting position of the agent and get a reference to its rigidbody. In the OnEpisodeBegin method, we reset the agent's position to the starting position, remove all limbs, create a new initial limb, reset the growth and extension abilities, and randomly set the position of the target. In the CollectObservations method, we add observations for the agent's position, the target's position, the number of limbs, and the growth and extension abilities.

In the OnActionReceived method, we first move the agent based on the first two elements of the vectorAction array. We then check if the third element is greater than 0.5 (indicating that the agent wants to grow a limb), and if so, we create a new limb if the agent can currently grow and hasn't reached the maximum number of limbs. We then set the canGrow variable to false so the agent can't grow another limb in the same episode. If the fourth element is greater than 0.5 (indicating that the agent wants to extend a limb), and if the agent can currently extend a limb and has at least one limb, we extend the last limb in the list and set the canExtend variable to false so the agent can't extend another limb in the same episode. We also add a small positive reward for growing or extending a limb.

In the Heuristic method, we allow the player to control the agent using the arrow keys to move and the space bar to grow a limb and the left shift key to extend a limb.

Finally, we define two methods that are called when the agent collides with the target or an obstacle. If the agent collides with the target, we give it a positive reward and end the episode. If the agent collides with an obstacle, we give it a negative reward and end the episode. We also define a method that is called when the agent exits an obstacle, which resets the growth and extension abilities so the agent can grow or extend limbs again.
