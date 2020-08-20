Title: Develop and Deploy with Kubernetes
Date: 2020-08-19
Author: Jack McKew
Category: Software
Tags: software
JavaScripts: mermaid.min.js


Following on with previous posts on this blog. This post will be going through how to develop & deploy our fibonacci application we previously built in a multi-container context. To reiterate we will be using the following technologies:

| Technology                | Use                                                                          |
| ------------------------- | ---------------------------------------------------------------------------- |
| Docker                    | Docker will be used to containerization of the services inside our app       |
| Amazon Web Services (AWS) | AWS will host and run our Kubernetes cluster                                 |
| Vue                       | Vue is the front-end JavaScript framework that we will use                   |
| Express                   | Express is responsible for the API between Redis, PostgreSQL and Vue         |
| Redis                     | Redis will store/retrieve any local data used by our users                   |
| PostgreSQL                | PostgreSQL will be our database                                              |
| Nginx                     | Nginx will handle the routing between our services                           |
| Github Actions            | Github Actions will be our CI/CD platform for running tests before deploying |

> Previously we made use of services provided by AWS for Redis & PostgreSQL, in this post these services will be run inside their own pods.

## The Architecture

To make our application run on Kubernetes, we need to make a few changes. In essence though the architecture will 

<div class="mermaid">
  graph LR
    subgraph Node
        tr>Traffic] --> is[Ingress Service]

        is --> cl[Client Deployment]

        is --> se[Server Deployment]

        se --> re[(Redis Deployment)]
        
        se --> po[(PostgreSQL Deployment)]

        po --> pv[PostgreSQL PVC]

        wo(Worker Deployment) --> re
    end
</div>

> The above chart was made with [mermaid.js](https://mermaid-js.github.io/mermaid/#/).

For each of the deployments (except the worker) we will be creating a ClusterIP service for maintaining the connection between each of the deployments. The PostgreSQL PVC is for a Persistent Volume Claim, which allows our node to consume abstract storage resources (we'll go into this further later on).

## ClusterIP Service

We need to set up a ClusterIP service for each of our deployments except the worker deployment. This will allow our services to communicate with others inside the node.

To do this, we create a configuration `yaml` file:

``` yaml
apiVersion: v1
kind: Service
metadata:
  name: client-clusterip-service
spec:
  selector:
    component: web
  ports:
    - port: 80
      targetPort: 80

```

Note that we keep the same selector as our deployments.

> ClusterIP is the default ServiceType in kubernetes.
> We can create multiple objects in a single yaml file by separating with `---`

## Persistent Volume Claim

A persistent volume allows a pod to share memory and read/write data on the host PC. The use-case for this are if our PostgreSQL database pod had crashed without a PVC, the data would essentially be lost as it was entirely contained within the pod, but with a persistent volume claim, our pod can restart by using the data that is stored on the host PC.

