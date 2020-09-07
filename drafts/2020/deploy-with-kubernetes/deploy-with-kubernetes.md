Title: Develop and Deploy with Kubernetes
Date: 2020-08-19
Author: Jack McKew
Category: Software
Tags: software
JavaScripts: mermaid.min.js

Following on with previous posts on this blog. This post will be going through how to deploy our fibonacci application we previously built in a Kubernetes cluster. To reiterate we will be using the following technologies:

| Technology     | Use                                                                    |
| -------------- | ---------------------------------------------------------------------- |
| Docker         | Docker will be used to containerization of the services inside our app |
| Vue            | Vue is the front-end JavaScript framework that we will use             |
| Google Cloud   | The cloud provider that will host our Kubernetes cluster               |
| Express        | Express is responsible for the API between Redis, PostgreSQL and Vue   |
| Redis          | Redis will store/retrieve any local data used by our users             |
| PostgreSQL     | PostgreSQL will be our database                                        |
| Nginx          | Nginx will handle the routing between our services                     |
| Github Actions | The CI/CD for our project                                              |

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

See the following posts for developing in different contexts:

- Container context: [INSERT DOCKER COMPOSE POST]
- Kubernetes context: [INSERT DEVELOP KUBERNETES POST]

## Cloud Provider

To deploy our Kubernetes cluster, we need a cloud provider, for this post we will be using Google Cloud. Other options are:

- Amazon Web Services (AWS)
- Digital Ocean
- Microsoft Azure
- Many more

## CI/CD

For our CI/CD we will be using GitHub Actions. Github Actions are free to public repositories, and I presented at PyconAU 2020 on the topic, find the recording at: [INSERT GITHUB ACTiONS TALK]

## Google Cloud

Now that we've logged into our Google Cloud console, we create a new project, enable billing and then head to Kubernetes Engine. This will go through some one time set up to enable the Kubernetes Engine API for our project and upon completion we can create a cluster. As soon as we hit `Create Cluster`, this begins the billing so be careful!
