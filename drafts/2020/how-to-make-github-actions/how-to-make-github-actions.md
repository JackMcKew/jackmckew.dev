Title: How to Make GitHub Actions
Date: 2020-04-xx
Author: Jack McKew
Category: CICD
Tags: cicd

From a recent post on this blog on how to use [GitHub Actions to easily integrate CI/CD into your repository](https://jackmckew.dev/github-actions-for-cicd.html), this post will go into how to create your own GitHub Action!

This post was inspired from developing a few GitHub Actions of my own, which I recently released!

## PyInstaller GitHub Actions

Do you ever want to share your Python code with others, but they don't have Python installed?

You can now easily package your code up as an executable (*.exe) file with GitHub Actions!

- Windows: <https://github.com/marketplace/actions/pyinstaller-windows>
- Linux: <https://github.com/marketplace/actions/pyinstaller-linux>

Once activated on your repository, each time you push, the action will be kicked off and upload a packaged application to your repository.

![PyInstaller Actions]({static img/pyinstaller-action.png})

## Interrogate GitHub Action

Interrogate checks your docstring coverage, integrate it easily into your CI workflow with GitHub Actions.

<https://github.com/marketplace/actions/python-interrogate-check>

## How These Actions were Made

Currently GitHub actions supports two types of actions out of the box (with subsequent documentation):

- [JavaScript](https://help.github.com/en/actions/creating-actions/creating-a-javascript-action)
- [Docker](https://help.github.com/en/actions/creating-actions/creating-a-docker-container-action)

The actions mentioned above are all Docker actions, so this post will focus on how to create Docker GitHub actions. The two tutorials linked above are a great resource for creating GitHub Actions. To summarise the 'creating a docker container action' page linked above, we need a few elements to get a basic docker action working:

- README
- Dockerfile
- entrypoint.sh
- action.yml

Let's take the [Interrogate Action](#interrogate-github-action) as the example on how it was made:

### README

This is essentially the 'documentation' behind an action, it should prescribe:

- What the action does
- Why someone should use it
- How to integrate it into a CI/CD workflow
- Descriptions of any inputs or outputs
  
### Dockerfile

For those that haven't used Docker before, this may be the most daunting part. Essentially a Dockerfile is a set up of steps that should be run when starting the container (aka booting the computer). There's a multitude of available containers developed by the community to handle most of the underlying steps for you. In the case of the interrogate action, we use the container image `python:3.8.1-alpine`.  What this does, it pulls a copy of the alpine distribution of Linux, pre-configured with Python for us and spins it up. See more variants of Python docker images here <https://hub.docker.com/_/python>.

Consider a container as a standalone object, when you start it, it won't have any of your files automatically copied into it, so you have to add any files specifically that you may need. Next we copy both the `requirements.txt` & `entrypoint.sh` from the repository into our container. Fantastic now we can do something with them. We upgrade pip, install any requirements (eg, interrogate) and then finish up by starting the shell script `entrypoint.sh`.

### Entrypoint.sh

The `entrypoint.sh` is the equivalent of opening a terminal on the freshly booted PC, and running commands inside it, and thus the formatting is very specific. Ensure to follow the operating system's convention for the docker image that you are using. In this case, it was Linux, so bash is our convention.

First off in the entryooint we need to enable options, this is done in bash using the command `set`. For most GitHub actions, they should at least enable the option to exit on first error with `set -e`, as this will make the CI/CD fail under that circumstance. For the interrogate action, we also enable export of all variables, and to trace our commands (prints them to the console), with `set -eax`. You can find more bash options here: <https://www.tldp.org/LDP/abs/html/options.html>

### Action.yml