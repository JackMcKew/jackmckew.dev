Title: Develop and Deploy with Docker
Date: 2020-07-xx
Author: Jack McKew
Category: Software
Tags: software

This post is intended to work through setting up a workflow with Docker. In particular, we will be setting up a production workflow for a web app. For this web app, we will need a workflow which supports:

1. Develop
2. Test
3. Deploy

We also want to be able to come back at a later date, further develop a feature and have the remaining steps be automated. At the centre of the workflow will be a repository (hosted in Github).

> This post will not be going through the details of how to utilise git/github.
> This workflow is 100% achievable without Docker, although Docker will make things much easier.

## The Web Application

For the web app we will use React, which is a javascript framework for managing the front end of applications. To generate the web app boilerplate for us, we will use `create-react-app`. For running this, ensure that Node.js is installed on the local PC. Finally run the command below, to initialise the front end component of React of our web app.

```bash
npx create-react-app frontend --template typescript
```

> Typescript is optional, but highly recommended.

##  Dockerfile

For this workflow we're going to set up two Dockerfiles, one for developing and one for production. Let's start with the developers Dockerfile, which we will aptly name `Dockerfile.dev`, we must ensure to add the `-f` flag along with the filename when building the Docker image with `docker build -f Dockerfile.dev .`.

The contents of our `Dockerfile.dev` will contain:

``` yaml
FROM node:alpine

WORKDIR '/app'

# Copy dependencies and install
COPY package.json .

RUN npm install

# Copy everything else
COPY . .

# Start development server
CMD ["npm","run","start"]
```

To circumvent the issue in that Docker typically takes snapshots of the code and we want our app to update on save, we use mount to create a 'reference' to our folder on the local PC. We do this by running the command:

``` bash
docker run -it -p 8000:3000 -v /app/node_modules -v ${pwd}:/app [image_id]
```

