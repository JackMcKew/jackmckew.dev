Title: Develop and Deploy with Kubernetes
Date: 2020-08-19
Author: Jack McKew
Category: Software
Tags: software
JavaScripts: mermaid.min.js

Following on with previous posts on this blog. This post will be going through how to develop & later on deploy our fibonacci application we previously built in a multi-container context. To reiterate we will be using the following technologies:

| Technology | Use                                                                    |
| ---------- | ---------------------------------------------------------------------- |
| Docker     | Docker will be used to containerization of the services inside our app |
| Vue        | Vue is the front-end JavaScript framework that we will use             |
| Express    | Express is responsible for the API between Redis, PostgreSQL and Vue   |
| Redis      | Redis will store/retrieve any local data used by our users             |
| PostgreSQL | PostgreSQL will be our database                                        |
| Nginx      | Nginx will handle the routing between our services                     |

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

We use a PVC over a persistent volume or a volume, as this allows us to declare the requirement that our pod needs storage at some point, rather than create an instance of storage prematurely, and gives more control to Kubernetes to solve our storage problem for us.

> Volumes on their lonesome are tied directly to pods, and thus if the pod crashes, the volume will be lost. Hence why we are not using volumes in this case. A volume is also different between Kubernetes and Docker.
> A *persistant* volume is not tied directly to pods, but is tied to the node overall, and thus if the node as a whole crashes, the data will be lost.

### PVC Configuration

Similar to how we attach a ClusterIP service to a pod, let's attach a PVC to a pod. What this will do, will instruct Kubernetes to 'advertise' storage space for pods to consume. If a pod consumes this claim, then it'll go and create a persistent volume or point to an already created persistent volume for us automatically. There is also many access modes we can define for our PVC:

| Access Mode   | Description                                  |
| ------------- | -------------------------------------------- |
| ReadWriteOnce | Can be used by a single node                 |
| ReadOnlyMany  | Multiple nodes can **read**                  |
| ReadWriteMany | Can be **read**/**written to** by many nodes |

``` yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: database-persistent-volume-claim
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 2Gi
```

This configuration will allow a single node access to 2 gigabytes of storage space available for both read & write operations.

Ensure that the pods that will access this volume claim have provided it under the `spec` tag in the pod configuration.

> Similarly, we can specify resource requirements/restraints in pods (eg, CPU resources).

## Environment Variables

Some of our pods depend on environment variables being set to work correctly (eg, REDIS_HOST, PGUSER, etc). We add using the `env` key to our `spec` > `containers` configuration.

For example, for our worker to connect to the redis deployment:

``` yaml
spec:
  containers:
    - name: worker
      image: jackmckew/multi-docker-worker
      env:
        - name: REDIS_HOST
          value: redis-cluster-ip-service
        - name: REDIS_PORT
          value: 6379
```

Note that for the value of the `REDIS_HOST` we are stating the name of the ClusterIP service we had previously set up. Kubernetes will automatically resolve this for us to be the correct IP, how neat!

### Secrets

Secrets are another type of object inside of Kubernetes that are used to store sensitive information we don't want to live in the plain text of the configuration files. We do this through a `kubectl` commad:

``` bash
kubectl create secret [secret_type] [secret_name] --from-literal key=value
```

There are 3 types of secret types, `generic`, `docker_registry` and `tls`, most of the time we'll be making use of the `generic` secret type. Similar to how we consume other services, we will be consuming the secret from the `secret_name` parameter. The names (but not the value) can always be retrieved through `kubectl get secrets`.

> Secrets are pertained only on the current machine, so this will not be transferred when moving to production or another machine, so be sure to repeat the process.

### Consuming Secrets as Environment Variable

Consuming a secret as an environment variable for a container is a little different to other environment variables. As secrets can contain multiple key value pairs, we need to specify the secret and the key to retrieve the value from:

``` yaml
- name: ENVIRONMENT_VAR_NAME
  valueFrom:
    secretKeyRef:
      name: secret_name
      key: key
```

## Ingress Service

The ingress service allows us to connect to other Kubernetes cluster from outside, and thus maintains how we should treat incoming requests and how to route them.

The entirety of our configuration for the ingress service is:

``` yaml
apiVersion: networking.k8s.io/v1beta1
kind: Ingress
metadata:
  name: ingress-service
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/use-regex: "true"
    nginx.ingress.kubernetes.io/rewrite-target: /$1
spec:
  rules:
    - http:
        paths:
          - path: /?(.*)
            backend:
              serviceName: client-cluster-ip-service
              servicePort: 8080
          - path: /fib/?(.*)
            backend:
              serviceName: client-cluster-ip-service
              servicePort: 8080
          - path: /api/?(.*)
            backend:
              serviceName: server-cluster-ip-service
              servicePort: 5000
```

Note that we make use of rewrite-target, this means that:

- `test.com/something` rewrites to `test.com/`
- `test.com/somethingelse` rewrites to `test.com/`
- `test.com/fib` rewrites to `test.com/fib/`

Any requests for `test.com/api` get routed to the specific server service for handling, while any others get sent to the front end.

## Deploy!

Now we are ready to deploy our Kubernetes cluster onto a cloud provider, this was originally detailed in this part of the post, but grew far longer than expected so another post was created!