Title: Develop and Deploy with Kubernetes
Date: 2020-08-19
Author: Jack McKew
Category: Software
Tags: software
JavaScripts: mermaid.min.js


Following on with previous posts on this blog. This post will be going through how to develop & deploy our fibonacci application we previously built in a multi-container context. To reiterate we will be using the following technologies:


| Technology                                  | Use                                                                          |
| ------------------------------------------- | ---------------------------------------------------------------------------- |
| Docker                                      | Docker will be used to containerization of the services inside our app       |
| Amazon Web Services (AWS) Elastic Beanstalk | Elastic Beanstalk will manage the deployment of our application              |
| Vue                                         | Vue is the front-end JavaScript framework that we will use                   |
| Express                                     | Express is responsible for the API between Redis, PostgreSQL and Vue         |
| Redis                                       | Redis will store/retrieve any local data used by our users                   |
| PostgreSQL                                  | PostgreSQL will be our database                                              |
| Nginx                                       | Nginx will handle the routing between our services                           |
| Github Actions                              | Github Actions will be our CI/CD platform for running tests before deploying |

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