Title: Intro to Kubernetes
Date: 2020-11-13
Author: Jack McKew
Category: Software
Tags: software

Kubernetes is a portable, extensible, open-source platform for managing containerized workloads and services, that facilitates both declarative configuration and automation. We use Kubernetes as a platform for orchestrating multiple Docker containers for our application, and enables us to scale our application easily.

Kubernetes is managed via a master node, and worker nodes, in combination we call this a cluster. We give instructions to the master node on how we want the cluster to run, and how many workers we need.

This post is apart of a series on Docker/Kubernetes, find the other posts at:

- [Intro to Docker](https://jackmckew.dev/intro-to-docker.html)
- [Develop and Develop with Docker](https://jackmckew.dev/develop-and-deploy-with-docker.html)
- [Develop and Develop Multi Container Applications](https://jackmckew.dev/develop-and-deploy-multi-container-applications.html)
- [Developing with Kubernetes](https://jackmckew.dev/developing-with-kubernetes.html)

![Kubernetes Logo]({static img/Kubernetes-logo.png})

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

NodePort services allow us to expose a container to the outside network (only for development purposes). We can use selectors and labels to be the equivalent of our service names in docker-compose.

#### Deployment

The deployment object type is better for running groups of identical pods, as the master can manage all the changes & updates for our pods for us (see below for limitations when using pods alone).

Similar to the pod yaml file, the `template` tag takes the exact same information to create any number of pods (replicas) as specified.

> Ensure to use matchLabels if using labels for the pods, as this will give the master information for updating the cluster.

We can check all the deployments currently running with `kubectl get deployments`.

## Kubectl

Kubectl is the tool that we use to manage our Kubernetes clusters. If we want to pass a config file into `kubectl` we use the command `kubectl apply -f [filename]`. Similar to `docker ps`, if we want to see all the running pods in our cluster, we can run `kubectl get pods`. Furthermore, to get all the running services we can run `kubectl get services`.

Once we have a pod running, we can check to see what containers are running with `docker ps`. If we kill the container running inside the pod, we will notice that if we run `docker ps` once again, it'll be live again. Kubernetes will try to restart any containers if anything goes wrong. Kubernetes will try it's best to keep the application in the state that we provide in the configuration.

### Update Existing Object

If a configuration has been provided a `name` in the `metadata`, the running object can be updated by changing the configuration provided the `name` remains the same.

This updated configuration can then be applied with `kubectl apply -f [filename]`.

> There is only a specific number of parameters we can change with this (eg for pods: image, activeDeadlineSeconds, etc). Which you will see an error if the variable falls outside the provided.

For maintaining sets of identical pods, we can bypass the limitations on what fields we can update with the `Deployment` object kind. Pods are good for one-off development purposes, while Deployments are better for development & production.

> Deployment updates work by attempting to make the changes, and if the above error occurs, it'll automatically kill the pod and restart with the updated configuration.

### Get Info about an Existing Object

If we had an object running within a cluster, and we wanted to get information about it, we can run `kubectl describe [object_type] [object_name]`.

Similarly, we can extract information about all objects of a certain type in the cluster by omitting the `object_name`. So our command would be `kubectl [object_type]`.

### Deleting Existing Objects

Similar to `docker stop`, we can use `kubectl delete -f [config_yaml]` to stop and delete an object from the cluster.

### Update Deployment Images

A workflow for Kubernetes is we want our application to keep running, and when we push a new image to Docker Hub, we want our Kubernetes cluster to update the objects running on this image, with the updated image.

> This is very challenging, here is a very thorough thread on a conversation discussing ways to do this: <https://github.com/kubernetes/kubernetes/issues/33664>

To do this imperatively, we ensure that the image we will be pulling is tagged with versioning on Docker Hub. After this we are able to run the command

``` bash
kubectl set image [object_type] / [object_name] [container_name] = [new_image_to_use]
```

After running this command, the deployment will update the running pods with the new image.