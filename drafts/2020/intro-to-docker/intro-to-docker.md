Title: Intro to Docker
Date: 2020-07-xx
Author: Jack McKew
Category: Software
Tags: software

What is docker? Docker is a platform for running software that is agnostic to the operating system it runs on. This is extremely useful around solving the *'But it works on my machine'* problem. This post will go through an intro to docker and how you can use it. A crucial part to Docker is the container, *a Docker container image is a lightweight, standalone, executable package of software that includes everything needed to run an application: code, runtime, system tools, system libraries and settings*

I did a post back in 2018 on containerization and mentioned Docker too! <https://jackmckew.dev/episode-6-containerization.html>

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

> The version is optional to provide, if it isn't provided it will default to latest.

### Alpine Docker Images

Note that we used `FROM alpine` earlier on in our Dockerfile. `alpine` is a term used in Docker to represent the most compressed and stripped down version of an image. If we wanted to use a different image like those listed on Docker Hub (https://hub.docker.com/search?q=&type=image), we could easily specify to get the `alpine` version of an image by using `FROM node:alpine`.  

> Check the description of an image to check whether an alpine version is available.

### Change Working Directory

We can change the working directory inside the container with `WORKDIR`. This is very useful if we don't want to copy things into the root directory of the container. If a folder isn't found in the argument to `WORKDIR`, it'll be created automatically.

## Mounting Files

Docker defaults to NOT include any files inside an image from the local PC. We always must mount any files we want to use inside the container in the Dockerfile. One way to do this is using the `COPY` argument in the Dockerfile.

This can be done with: `COPY [location_on_local_PC_to_copy] [place_to_story]`

An example of this is: `COPY ./ ./`, this will copy the current folder relative to where the terminal is, and places it in the current working directory inside the container.

## Port Mapping

By default no traffic will be routed into a container, meaning a container has it's own set of ports that are not connected to the local PC. Thus we need to set up a mapping between the local PC and the containers ports.

This is not changed within the Dockerfile, but rather when we run the container with the `-p` flag. This can be done with:

```bash
docker run -p [local_pc_port] : [container_port] [image_name]
```

> By default there is no limitation on default traffic getting out of a container, only limitations on traffic getting in.

> This local PC port and the container port do NOT have to match.

## Docker Compose

Docker compose is a separate tool apart of the Docker CLI, this is used to start up multiple containers at the same time. This helps automate the arguments that would be need to connect multiple containers to talk to each other.

We need to create `docker-compose.yml` files that we can feed into the docker compose CLI, this is essentially replacing the arguments that we've been typing into the Docker CLI previously.

Here's an example of a `docker-compose.yml` which will:

1. Create an container that will host a redis server
2. Create an container that will host a nodejs app
3. Network the ports of the nodejs app container

``` yaml
version: "3"
services:
  redis-server:
    image: "redis"
  node-app:
    build: .
    ports:
      - "8000:8000"
```

Let's break it down, first we specify the version of docker-compose to run on. Following that under services, each container that we want to run is indented and then named. Inside the service declaration we can either specify an image to use, or whether to use docker build to build a Dockerfile (note this will look in the current directory for a Dockerfile). Finally mapping port 8000 of the local PC to port 8000 of the docker container.

By using docker-compose, this also automates that the docker containers run on the same network. This would be a major pain to do without using docker-compose.

Once we've created a `docker-compose.yml`, we can run this by running the command `docker-compose up` inside the same directory. We can also specify that we want to rebuild all the images inside the `docker-compose.yml` file with `--build`, so the new command becomes `docker-compose up --build`.

### Stopping Docker Compose

Rather than using `docker stop` with each of the IDs of the containers that we created. Luckily, we can simply run `docker-compose down` to stop all the containers after using `docker-compose up`. This is particularly useful when we run `docker-compose up -d` which will run the containers in the background, so we can't just CTRL+C out of it.

### Restart Policies

If any container crashes, docker-compose defaults to the restart policy of `"no"`, which never attempts to restart the container. Potential restart policies in docker-compose are:

| Policy         | Description                                                    |
| -------------- | -------------------------------------------------------------- |
| "no"           | Never restart a container on stop/crash                        |
| always         | If a container stops for any reason at all, attempt to restart |
| on-failure     | Only restart if a container stops with an error                |
| unless-stopped | Always restart unless forcibly stopped                         |

The restart policy is defined along with other arguments under the service name.

### Check Docker Compose Status

Similarly to running `docker ps`, we can run `docker-compose ps` to check all the running containers that we started with `docker-compose up`. 

> This must be used in the same directory as the `docker-compose.yml` file.

