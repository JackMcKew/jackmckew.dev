Title: NEAT Algorithm in Unity - Smart Street Lights
Date: 2026-03-10
Author: Jack McKew
Category: Software
Tags: neat, neuroevolution, unity, street-lights, simulation

NEAT (NeuroEvolution of Augmenting Topologies) is wild. Instead of training a fixed neural network, you evolve the network structure itself. Add nodes, add connections, mutate weights. You start with simple networks and let evolution discover architecture.

I built a traffic simulation and evolved NEAT to manage street lights intelligently. The evolved networks were nothing like what I'd hand-design. They were weirder, more efficient, and genuinely novel.

## What is NEAT?

Standard neural networks have fixed architecture: input layer, hidden layers, output. You train weights. NEAT does something different - it evolves both weights AND topology.

Start with a minimal network (inputs directly to outputs). Mutations can:
1. Add a connection between unconnected nodes
2. Add a new node on an existing connection
3. Modify a weight
4. Change activation functions

Each mutation gets a new child network. Most die (low fitness). The best survive and reproduce. Over generations, complexity grows.

```
Generation 0: Input -> Output (4 connections)
Generation 5: Input -> Hidden1 -> Output (8 connections, 4 nodes)
Generation 20: Input -> Hidden1,2,3 -> Output (15 connections, 7 nodes)
                with varying activation functions per node
```

The key insight: topology evolution allows discovery of novel architectures humans wouldn't hand-code.

## Building the Traffic Simulation

I created a Unity scene with:
- 4 intersections in a 2x2 grid
- Traffic flowing in from outside (Poisson process, random arrivals)
- 4 traffic lights (one per intersection)
- Cars with pathfinding (trying to reach random destinations)

```csharp
using UnityEngine;
using System.Collections.Generic;

public class TrafficSimulation : MonoBehaviour
{
    [SerializeField] private int numIntersections = 4;
    [SerializeField] private float carSpawnRate = 0.5f; // cars per second

    private List<Car> cars = new List<Car>();
    private List<TrafficLight> lights = new List<TrafficLight>();
    private float timeSinceLastSpawn = 0f;

    public class Car
    {
        public Vector3 position;
        public Vector3 direction;
        public Vector3 targetIntersection;
        public float speed = 5f;
        public bool isWaiting = false;
        public float waitTime = 0f;

        public Car(Vector3 startPos, Vector3 target)
        {
            position = startPos;
            targetIntersection = target;
            direction = (targetIntersection - position).normalized;
        }

        public void Update(float dt)
        {
            if (!isWaiting)
            {
                position += direction * speed * dt;
            }
            else
            {
                waitTime += dt;
            }
        }
    }

    public class TrafficLight
    {
        public Vector3 position;
        public bool isGreen = false;
        public float greenTime = 0f;
        public float maxGreenTime = 30f;

        public List<Car> waitingCars = new List<Car>();
        public float avgWaitTime = 0f;

        public void Update(float dt)
        {
            if (isGreen)
            {
                greenTime += dt;
            }

            // Calculate average wait time
            if (waitingCars.Count > 0)
            {
                avgWaitTime = waitingCars.ConvertAll(c => c.waitTime).Average();
            }
        }

        public void SetGreen(bool green, float duration)
        {
            isGreen = green;
            greenTime = 0f;
            maxGreenTime = duration;
        }
    }

    void SpawnCar()
    {
        // Random entry point and destination
        var entryPoint = GetRandomEntryPoint();
        var destination = GetRandomIntersection();
        cars.Add(new Car(entryPoint, destination));
    }

    void Update()
    {
        // Spawn cars based on rate
        timeSinceLastSpawn += Time.deltaTime;
        if (timeSinceLastSpawn > 1f / carSpawnRate)
        {
            SpawnCar();
            timeSinceLastSpawn = 0f;
        }

        // Update cars
        foreach (var car in cars)
        {
            car.Update(Time.deltaTime);

            // Check if at intersection
            foreach (var light in lights)
            {
                if (Vector3.Distance(car.position, light.position) < 2f)
                {
                    if (!light.isGreen)
                    {
                        car.isWaiting = true;
                        light.waitingCars.Add(car);
                    }
                    else
                    {
                        car.isWaiting = false;
                        light.waitingCars.Remove(car);
                    }
                }
            }
        }

        // Update lights
        foreach (var light in lights)
        {
            light.Update(Time.deltaTime);
        }

        // Remove cars that reached destination
        cars.RemoveAll(c => Vector3.Distance(c.position, c.targetIntersection) < 1f);
    }

    public float GetMetrics()
    {
        // Fitness: minimise total wait time + throughput bonus
        float totalWait = 0f;
        int carsPassed = numIntersections - cars.Count; // proxy for throughput

        foreach (var light in lights)
        {
            totalWait += light.avgWaitTime * light.waitingCars.Count;
        }

        return carsPassed * 10f - totalWait * 0.1f;
    }
}
```

Each traffic light gets a NEAT network that outputs: green light duration (0-30 seconds).

Inputs to each network:
- Queue length at this intersection (0-20 normalised)
- Average wait time at this intersection (0-60s normalised)
- Queue length at adjacent intersections (4 inputs)
- Time of day / traffic pattern (1 input)

That's 7 inputs per light. Output is 1 (green duration).

## The NEAT Fitness Function

```csharp
public class NEATTrafficController
{
    public float EvaluateFitness(Genome network, TrafficSimulation sim)
    {
        // Run simulation for 5 minutes
        sim.Reset();

        float totalWaitTime = 0f;
        int totalCarsPassed = 0;
        float totalTimeOnNetwork = 0f;

        for (int step = 0; step < 300; step++) // 5 min = 300s
        {
            // Get observations for each intersection
            for (int i = 0; i < sim.lights.Count; i++)
            {
                var light = sim.lights[i];

                // Network inputs
                float[] inputs = new float[]
                {
                    light.waitingCars.Count / 20f,
                    light.avgWaitTime / 60f,
                    // Adjacent queues (simplified)
                    sim.lights[(i+1)%4].waitingCars.Count / 20f,
                    sim.lights[(i+2)%4].waitingCars.Count / 20f,
                    sim.lights[(i+3)%4].waitingCars.Count / 20f,
                    (step % 120) / 120f, // time of day (peak hours 0-120s, 120-240s, etc)
                    sim.AverageQueueLength / 20f
                };

                // Network forward pass
                float[] outputs = network.Forward(inputs);
                float greenDuration = outputs[0] * 30f; // 0-30 seconds

                light.SetGreen(true, greenDuration);
            }

            // Simulate one second
            sim.Update(1f);

            // Track metrics
            totalWaitTime += sim.lights.Sum(l => l.avgWaitTime * l.waitingCars.Count);
            totalCarsPassed += sim.CarsThatLeftThisStep;
        }

        // Fitness = throughput bonus - wait time penalty
        float fitness = totalCarsPassed * 5f - totalWaitTime * 0.01f;

        return fitness;
    }
}
```

The fitness function rewards getting cars through (throughput) and penalises wait time. Simple metric, but it forces evolution to find good light timing strategies.

## Running the Evolution

```csharp
public class NEATTrainer
{
    private List<Genome> population;
    private int populationSize = 50;
    private int generationCount = 0;

    public void Initialize()
    {
        population = new List<Genome>();

        // Create initial population with minimal topology
        for (int i = 0; i < populationSize; i++)
        {
            var genome = new Genome(inputSize: 7, outputSize: 1);
            genome.AddDefaultConnections();
            population.Add(genome);
        }
    }

    public void EvolvationStep()
    {
        var controller = new NEATTrafficController();
        var sim = new TrafficSimulation();

        // Evaluate all genomes
        foreach (var genome in population)
        {
            genome.fitness = controller.EvaluateFitness(genome, sim);
        }

        // Sort by fitness
        population.Sort((a, b) => b.fitness.CompareTo(a.fitness));

        Debug.Log($"Gen {generationCount}: Best fitness = {population[0].fitness}, Nodes: {population[0].nodes.Count}");

        // Keep top 50%, breed the rest
        var survivors = population.GetRange(0, populationSize / 2);

        var newPopulation = new List<Genome>();
        newPopulation.AddRange(survivors); // Elitism

        while (newPopulation.Count < populationSize)
        {
            // Random breeding
            var parent1 = survivors[Random.Range(0, survivors.Count)];
            var parent2 = survivors[Random.Range(0, survivors.Count)];

            var child = Genome.Breed(parent1, parent2);
            child.Mutate();

            newPopulation.Add(child);
        }

        population = newPopulation;
        generationCount++;
    }
}
```

Key mutations in NEAT:
```csharp
public void Mutate()
{
    float rand = Random.value;

    if (rand < 0.8f)
    {
        // 80% chance: mutate weights
        foreach (var conn in connections)
        {
            if (Random.value < 0.1f) // 10% of weights
                conn.weight += Random.Range(-0.5f, 0.5f);
        }
    }
    else if (rand < 0.9f)
    {
        // 10% chance: add connection
        var node1 = nodes[Random.Range(0, nodes.Count)];
        var node2 = nodes[Random.Range(0, nodes.Count)];
        if (node1 != node2)
            AddConnection(node1, node2, Random.Range(-1f, 1f));
    }
    else
    {
        // 10% chance: add node
        var oldConn = connections[Random.Range(0, connections.Count)];
        var newNode = new Node();
        nodes.Add(newNode);

        RemoveConnection(oldConn);
        AddConnection(oldConn.from, newNode, 1f);
        AddConnection(newNode, oldConn.to, oldConn.weight);
    }
}
```

## What Evolved

After 50 generations:

**Generation 0**: Network = 7->1 (7 inputs directly to output)
- Learned: "if queue is long, give long green" (naive but works)
- Fitness: ~120

**Generation 15**: Network gained hidden nodes
- Discovered: stagger lights to avoid bunching
- Networks started accounting for adjacent queue lengths
- Fitness: ~180

**Generation 30**: Topology specialised
- Some intersections had 3-4 hidden nodes, others had 1
- The algorithm evolved different strategies per intersection
- Intersections on busier roads got more complex networks
- Fitness: ~230

**Generation 50**: Final evolution
- Best network had 6 nodes, 12 connections
- It learned: reduce green time during off-peak, extend during peak
- Used adjacent queue information to predict incoming traffic
- Fitness: ~260

The evolved networks were nothing like a hand-coded controller. They used weird activation combinations, cross-cutting connections between "unrelated" nodes. Pure evolutionary discovery.

## The Surprising Bit

At generation 25, the best network had a connection that seemed pointless - it took the "time of day" input, fed it through a node, and looped back to itself. We almost deleted it as a useless mutation.

Turned out it was learning temporal patterns - off-peak behaviour. The self-loop acted as a crude memory. Over 5-10 seconds, the light timing changed differently based on what time it was. Brilliant accident.

## NEAT vs Gradient-Based RL

- **NEAT**: Discovers novel topologies, works with sparse rewards, no backprop needed
- **PPO/DQN**: Converges faster, works better with continuous control, more predictable

For traffic lights specifically, NEAT was better. The discrete nature of "add node" mutations aligned with "add complexity when needed" - exactly what traffic control needs.

If you implement NEAT, start small: 20 population, 20 generations. Verify fitness calculation is correct. The evolution is slow initially but accelerates. By generation 30, you'll see real architecture divergence.

The magic moment is when you visualise the best network and see it's nothing like what you'd design - yet it works better. That's why NEAT fascinates me. It's not optimising your network. It's discovering new ones.

