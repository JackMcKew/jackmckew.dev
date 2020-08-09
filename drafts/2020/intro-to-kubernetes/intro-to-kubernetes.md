Title: Intro to Kubernetes
Date: 2020-08-xx
Author: Jack McKew
Category: Software
Tags: software

Kubernetes is a portable, extensible, open-source platform for managing containerized workloads and services, that facilitates both declarative configuration and automation. We use Kubernetes as a platform for orchestrating multiple Docker containers for our application, and enables us to scale our application easily.

Kubernetes is managed via a master node, and worker nodes, in combination we call this a cluster. We give instructions to the master node on how we want the cluster to run, and how many workers we need.

## Minikube

Minikube is a way of running a development cluster on our local PC. When running in production however, we use managed services offered by different platforms (eg, AWS, GCP, etc). To interact with `minikube` as it is running though, we use another tool called `kubectl`.

## Docker Compose to Kubernetes

| Docker Compose Terminology                              | Kubernetes Terminology                       |
| ------------------------------------------------------- | -------------------------------------------- |
| Each entry could build an image                         | Kubernetes expects all images to be built    |
| Each entry represents a container                       | One config file per object we want to create |
| Each entry defines the networking configuration (ports) | We have to set up all networking manually    |

### What's an Object?

Notice that we mentioned objects as the equivalent in Kubernetes, but what does this mean? Objects serve different purposes:

- Running a container
- Monitoring a container
- Setting up networking
- etc

Example object types include:

- StatefulSet
- ReplicaController
- Pod
- Service

> There are multiple API versions which gives us access to a different set of object types

#### Pods

Pods let us run containers within nodes. These are one of the most basic objects we can create within Kubernetes. Typically we only put containers that are tightly coupled together within a pod. For example, we might run a database pod which is comprised of 3 containers, the database runtime, a logger and a backup manager. Since if any of these are solely dependant on other containers running, it makes sense to group them together in a pod.

#### Services

Services let us set up networking within a Kubernetes cluster. There is also 4 sub-types of services:

- ClusterIP
- NodePort
- Ingress
- LoadBalancer

NodePort services allow us to expose a container to the outside network (only for development purposes). 