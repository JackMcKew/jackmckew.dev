Title: Intro to Docker
Date: 2020-07-xx
Author: Jack McKew
Category: Software
Tags: software

What is docker? Docker is a platform for running software that is agnostic to the operating system it runs on. This is extremely useful around solving the *'But it works on my machine'* problem. This post will go through an intro to docker and how you can use it. A crucial part to Docker is the container, *a Docker container image is a lightweight, standalone, executable package of software that includes everything needed to run an application: code, runtime, system tools, system libraries and settings*

## Docker Ecosystem

Docker isn't a single program, it's a suite of programs which we'll refer to as an ecosystem. A brief description of all the components that make the ecosystem is:

| Service        | Description                                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Docker Client  | The docker client is how we interact with Docker (eg on the command line)                                                 |
| Docker Server  | The docker server manages running programs inside isolated containers                                                     |
| Docker Machine | Docker machine lets us install docker engine on virtual hosts (essentially an operating system inside a operation system) |
| Docker Images  | A docker image is a read-only template of instructions on how to create a docker container                                |
| Docker Hub     | Docker hub is a free service provided by Dockeer for finding and sharing container images                                 |
| Docker Compose | Docker compose is how we can run multi-container applications.                                                            |

## Installing Docker

Docker is free to download from <docker.com> along with instructions on installing on your given operating system.

<https://www.docker.com/products/docker-desktop>

## Maintaining Docker in the Command Line

There are many useful commands for interacting with the Docker client.

| Command                           | Description                                                                                                                                                                            |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docker run [container_id/image]` | Docker run allows us to both create & start a container from either an ID or an image name. If the docker image isn't found on the local PC, it'll attempt to download from Docker Hub |
| `docker ps`                       | This shows all running containers on the current PC                                                                                                                                    |
| `docker ps --all`                 | This shows all running & stopped containers on the current PC                                                                                                                          |
| `docker stop [container_id]`      | This stops a running container, if it doesn't stop after 10 seconds, it will kill the container                                                                                        |
| `docker kill [container_id]`      | This immediately shuts the container without allowing applications to stop inside the container                                                                                        |

## Dockerfile

A Dockerfile is a read-only template with instructions for creating a Docker container/image. It's composed with a series of commands, along with their given arguments. A straightforward example of a Dockerfile is:

```yaml
# Use an existing docker image as a base
FROM alpine

# Download and install a dependency
RUN apk add --update redis

# Tell the the image what to do when it starts
# as a container
CMD ["redis-server"]
```

When we create this Docker image with `docker build Dockerfile`:

1. We use a base starting point of Alpine (a distribution of Linux), if this isn't found on the local PC, it'll download from Docker Hub
2. We install a program called `redis` using a pre-installed `apk` tool
3. We run `redis-server` inside the container

### Tagging Images

Normally when we run `docker build` it'll return a container ID, which we'll use to run the container with `docker run`. Rather than having to copy/paste the container ID each time, we can tag an image with a human-readable name.

To do this we can use the `-t` option for `docker build`. An example is:

`docker build -t [docker_id] / [project_name] : [version]`

So for me to tag an image I'd run:

`docker build -t jackmckew/my-new-docker-image:latest Dockerfile`

Which if we wanted to run this image, we can do this now with `docker run jackmckew/my-new-docker-image`
