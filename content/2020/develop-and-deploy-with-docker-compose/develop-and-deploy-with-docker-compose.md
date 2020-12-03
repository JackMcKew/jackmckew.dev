Title: Develop and Deploy Multi-Container Applications
Date: 2020-11-06
Author: Jack McKew
Category: Software
Tags: software

Following on with previous posts on this blog. This post will be going through how to develop & deploy a multi-container application, our application (albeit basic) will allow users to input a number which will correspond to the index in the Fibonacci sequence, and our application will respond with the computed number. Redis will store this number locally to give users a list of recently requested indexes, and PostgreSQL will store the input and output. More specifically we will be using the following technologies:

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

Let's start by diving into each of the services inside our application and how to set them up.

> This post won't go into how to Dockerize each service in particular, more so how to connect them all together.

*Find all the source code for this project at: <https://github.com/JackMcKew/multi-docker>*


This post is apart of a series on Docker/Kubernetes, find the other posts at:

- [Intro to Docker](https://jackmckew.dev/intro-to-docker.html)
- [Develop and Develop with Docker](https://jackmckew.dev/develop-and-deploy-with-docker.html)
- [Intro to Kubernetes](https://jackmckew.dev/intro-to-kubernetes.html)
- [Developing with Kubernetes](https://jackmckew.dev/developing-with-kubernetes.html)
- [Deploying with Kubernetes](https://jackmckew.dev/deploying-with-kubernetes.html)
- [Deploy a Node Web App to AWS Elastic Beanstalk with Docker](https://jackmckew.dev/deploy-a-node-web-app-to-aws-elastic-beanstalk-with-docker.html)

## Vue

*Find all the source code for the front end client at: <https://github.com/JackMcKew/multi-docker/tree/master/client>*

Vue is a JavaScript framework for creating user interfaces. We will be using it for the 'front-end' portion of the application. Vue can be installed through npm and once installed, we can run `vue create project_name` in the command line to create a template project for us. There is many options to enable in the creation of a project, a good option is to enable both unit testing & typescript. Once the project has been created, we can navigate into the directory and run `npm run serve`, this will set up our Vue project to enable us to visit `localhost:8080`.

Now to set up the user interface for our users to input the index of the fibonacci sequence they wish to calculate, we need to set up a new page for the users to land on. This will involve changing things in 3 places: components, views and router.

This is what we will be building with Vue:

![Vue Fib Input Page]({static img/vue-fib.png})

### FibInputForm Component

Components are pieces of user interface that we can access in multiple parts of our application, we build a component which will contain both the HTML and javascript for driving the user input, and for displaying the output retrieved from Redis or PostgreSQL. Vue components are typically comprised of a `template` block and a corresponding `script` and `style` block. When writing the template for a component, there is numerous Vue specific attributes that we can provide the elements in the HTML. For this project we will make use of Bulma/Buefy CSS (which can be installed with `npm install bulma` or `npm install buefy`) for our styling.

We create a file named `FibInputForm.vue` inside `project_name/src/components` with the contents:

``` html
<template>
  <div class="box">
    <div class="columns is-centered">
      <form @submit.prevent="handleSubmit">
        <div class="field has-addons ">
          <div class="control">
            <input
              v-model="inputValue"
              onfocus="if(this.value == 'Enter a value') { this.value = ''; }"
              class="input is-primary"
              type="text"
            />
          </div>
          <div class="control">
            <button class="button is-primary" type="submit">Submit</button>
          </div>
        </div>
      </form>
    </div>

    <ul v-if="seenIndexes && seenIndexes.length">
      <h3>Indexes I have seen:</h3>

      <p>{{ seenIndexes.map((x) => x.number).join(", ") }}</p>
    </ul>

    <ul>
      <h3>Calculated Values:</h3>

      <li v-for="(value, name) in values" :key="name">
        <p>For index {{ name }}, I calculated {{ value }}</p>
      </li>
    </ul>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "FibInput",
  data() {
    return {
      seenIndexes: [],
      values: {},
      index: "",
      inputValue: "Enter a value",
    };
  },

  // // Fetches posts when the component is created.
  async created() {
    try {
      const values = await axios.get("/api/values/current");
      this.values = values.data;
      // this.values = await axios.get("/api/values/current");
      const indexes = await axios.get("/api/values/all");
      this.seenIndexes = indexes.data;
    } catch (e) {
      this.errors.push(e);
    }
  },

  methods: {
    async handleSubmit() {
      await axios.post("/api/values", {
        index: this.inputValue,
      });

      this.index = "";

      window.location.reload();
    },
  },
};
</script>

```

To briefly cover the functionality above, the template is built up of 3 parts, the input form where users submit an index to query, a list of the latest indexes as stored in Redis separated by a comma and finally a list of the calculated as retrieved from the PostgreSQL database. We use `axios` to interface we the API that we will create with `express`. We query the API upon load, and the page is always reloaded when submit is pressed. Now that this has been exported, it can be imported from any other point in our web application and placed in with a `<FibInputForm/>` element! Neat!

### FibInputPage View

Now that we have our component, we need a page to put it on! We create a new file within `project_name/src/views` named `FibInputPage.vue` with the contents:

``` html
<template>
  <section class="section">
    <div class="container">
      <div class="columns is-centered">
        <div class="column is-half">
          <FibInputForm />
        </div>
      </div>
    </div>
  </section>
</template>

<script>
// @ is an alias to /src
import FibInputForm from "@/components/FibInputForm.vue";

export default {
  name: "Fib",
  components: {
    FibInputForm,
  },
};
</script>

```

As we can see above, we've imported our neat little `FibInputForm` and used it after placing it in a centered section. Again we export the page view so we can import into the router to make sure it's linked to a URL.

### Routing the Page

Lastly for Vue, we need to set up a route so users can reach our page, both within the `vue-router` and on the main page (`App.vue`). Routes are all defined within `project_name/router/index.ts`. So we need to add in a new one for our `FibInputPage` by adding the following object into the routes array:

``` html
  {
    path: "/fib",
    name: "Fib",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/FibInputPage.vue"),
  },
```

Next to ensure the route is accessible from a link on the page, add a `router-link` element into the template of `App.vue`:

``` html
<router-link to="/fib">Fib</router-link> |
```

## Redis

*Find all the source code for the redis service at: <https://github.com/JackMcKew/multi-docker/tree/master/worker>*

Redis is an open source, in-memory data store, we give it a key and a value, which it'll store. Later we can ask with the key, and get the value back. We are going to set up two parts to make this service work as expected. The redis runtime is managed for us directly from using the redis image as provided on Docker Hub, but we need to make a node.js project to interface with it.

We do this by creating 3 files: `package.json`, `index.js` and `keys.js`. `package.json` defines what dependencies need to be installed, and how to run the project. `index.js` manages the redis client and contains the functionality for calculating the fibonacci sequence when given an index. `keys.js` contains any environment variables that the project may need. In particular we use environment variables so docker-compose can link all the services together later on.

Here is the code for the core of this project, `index.js`:

``` js
const keys = require("./keys");
const redis = require("redis");

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});

const sub = redisClient.duplicate();

function fib(index) {
  if (index < 2) return 1;
  return fib(index - 1) + fib(index - 2);
}

sub.on("message", (channel, message) => {
  redisClient.hset("values", message, fib(parseInt(message)));
});

sub.subscribe("insert");

```

As we can see, we initialise a redis client as per the environment variables set in `keys.js`, we create a duplicate of the client because we wish to interact with it (must duplicate the client otherwise when communicating we'll end up with one big mess). We define our ever so special fibonacci function (this is slow on purpose) and finally we set a method that when given a message will communicate with redis for us.

## PostgreSQL

*Find all the source code for the PostgreSQL service at: <https://github.com/JackMcKew/multi-docker/tree/master/server>*

We are going to use the PostgreSQL service part of our project to contain the interface with the database, and the API with `express`. Very similar to our redis project, we need a `package.json`, `index.js` and `keys.js`. Let's dive straight into the code inside `index.js`:

``` js
const keys = require("./keys");

// Express App Setup
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Create and Connect to Postgres Client

const {
    Pool
} = require("pg");

const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort,
});
pgClient.on('connect', () => {
    pgClient
        .query('CREATE TABLE IF NOT EXISTS values (number INT)')
        .catch((err) => console.log(err))
})


// Create and Connect to Redis Client
const redis = require("redis");
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000,
});

const redisPublisher = redisClient.duplicate();

// Express Route Handlers

// Test Route
app.get("/", (req, res) => {
    res.send("Hello there");
});

// All indices submitted to DB
app.get("/values/all", async(req, res) => {
    const values = await pgClient.query("SELECT * FROM values");

    res.send(values.rows);
    // res.send(values.map(x => x.number))
});

// Get current indices in Redis
app.get("/values/current", async(req, res) => {
    redisClient.hgetall("values", (err, values) => {
        res.send(values);
    });
});

// Receive new values
app.post("/values", async(req, res) => {

    const index = req.body.index;

    if (parseInt(index) > 40) {
        return res.status(422).send("Index too high, try smaller number");
    }

    redisClient.hset("values", index, "Nothing yet!");

    redisPublisher.publish("insert", index);

    pgClient.query("INSERT INTO values(number) VALUES($1)", [index]);

    res.send({
        working: true
    });
});

app.listen(5000, (error) => {
    console.log("Listening");
});
```

We do a series of things here:

1. Initialise our `express` router which will be the API
2. Create a client for the PostgreSQL database (ensuring to create a table if it doesn't exist)
3. Create another client for our redis service, which will publish any keys requested as to show to the user later on
4. Set up our API end points, to either get all the indexes ever requested or the latest
5. Set up the API post method, which will handle sending the request to redis and storing in the database
6. Listen on the port for any incoming requests!

## Nginx

Nginx in this project helps us create all the connections between the services and for them all to play nicely. How nginx works is by defining any connections in a configuration file, and pass that configuration file upon runtime.

This is our `default.conf` nginx configuration for this project:

``` nginx
upstream client {
    server client:8080;
}

upstream api {
    server api:5000;
}

server {
    listen 80;

    location / {
        proxy_pass http://client;
    }

    location /api {
        rewrite /api/(.*) /$1 break;
        proxy_pass http://api;
    }
}
```

We are doing a series of things once again:

1. Our Vue front end listens on port 8080 by default, so that's where the client connection lives
2. Our API back-end (PostgreSQL) is listening on port 5000
3. Our nginx runtime will listen on port 80 and route as required

We also set up a few locations, these help nginx 'finish' the route. `/` means any incoming connection, pass it off to the front end to render. If any request connection comes in containing `/api` then we want to pass that request to the service, so we rewrite the URL to be the correct URL.

## Docker Compose

Now that we've got our individual services all configured, we need a way to run them all at the same time. We need to create a `docker-compose.yml` which will contain all the environment variables, and how each service depend/connect to each other so we can run it all!

``` yaml
version: "3"
services:
  postgres:
    image: "postgres:latest"
    environment:
      - POSTGRES_PASSWORD=postgres_password
  redis:
    image: "redis:latest"
  api:
    depends_on:
      - postgres
    build:
      dockerfile: Dockerfile.dev
      context: ./server
    volumes:
      - /app/node_modules
      - ./server:/app
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - PGUSER=postgres
      - PGHOST=postgres
      - PGDATABASE=postgres
      - PGPASSWORD=postgres_password
      - PGPORT=5432
  client:
    build:
      dockerfile: Dockerfile.dev
      context: ./client
    volumes:
      - /app/node_modules
      - ./client:/app
  worker:
    build:
      dockerfile: Dockerfile.dev
      context: ./worker
    volumes:
      - /app/node_modules
      - ./worker:/app
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
  nginx:
    depends_on:
      - api
      - client
    restart: always
    build:
      dockerfile: Dockerfile.dev
      context: ./nginx
    ports:
      - "8000:80"
```

Here we are setting up all of the docker containers we wish to run in parallel that will make up our entire project:

- PostgreSQL Container
    - We use the postgres image on Docker Hub and must pass in the default password to get into it
- Redis Container
    - We use the redis image on Docker Hub (that easy!)
- API Container
    - This contains the code behind the API which interfaces with redis & postgres
- Client Container
    - Our Vue frontend that the users will see
- Worker Container
    - This contains the code to calculate the fibonacci sequence by interfacing with the redis runtime
- Nginx Container
    - Our nginx container that'll handle all the routing in between each of the services, this is what is exposed on port 8000 on the local PC when we run all these containers

Note that our environment variables (which were set in `keys.js` earlier), are just the name of the service given in the `docker-compose.yml` file. Docker Compose handles all the renaming when each service is connected up for us! How awesome is that!

## Github Actions

Now that we've set all of services and make sure they place nice in Docker Compose, it's time to implement CI/CD with Github Actions so whenever we push new versions of our code, it'll automatically test that everything works and deploy our new version of the application. We do this by creating a `test-and-deploy.yml` within `.github/workflows/` which contains:

``` yaml
name: Test & Deploy
on:
  push:
    branches:
      - master

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Latest Repo
        uses: actions/checkout@master

      - name: Build Dev Docker Image - Client
        run: docker build -t jackmckew/multi-docker-dev -f ./client/Dockerfile.dev ./client

      - name: Run Test Suite - Client
        run: docker run -e CI=true jackmckew/multi-docker-dev npm run test:unit

      # Deploy to Dockerhub
      - name: Build and Push Production Container - Client
        if: success()
        uses: docker/build-push-action@v1
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
          repository: jackmckew/multi-docker-client
          tags: latest
          path: ./client

      - name: Build and Push Production Container - Server
        if: success()
        uses: docker/build-push-action@v1
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
          repository: jackmckew/multi-docker-server
          tags: latest
          path: ./server

      - name: Build and Push Production Container - Nginx
        if: success()
        uses: docker/build-push-action@v1
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
          repository: jackmckew/multi-docker-nginx
          tags: latest
          path: ./nginx

      - name: Build and Push Production Container - Worker
        if: success()
        uses: docker/build-push-action@v1
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
          repository: jackmckew/multi-docker-worker
          tags: latest
          path: ./worker

      - name: Generate deployment package
        run: zip -r deploy.zip . -x '*.git*'

      - name: Deploy to EB
        uses: einaregilsson/beanstalk-deploy@v11
        with:
          aws_access_key: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws_secret_key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          application_name: mulit-docker
          environment_name: MulitDocker-env
          version_label: 12345
          version_description: ${{github.SHA}}
          region: ap-southeast-2
          deployment_package: deploy.zip
```

We are doing the following steps:

1. Get the latest copy of all the source code
2. Build & Test our application to make sure it works
3. Build & Publish each container to Docker Hub so any other deployment service can pull directly from there
4. Deploy our application to Elastic Beanstalk

## Docker Hub

Everything's now set up! For another user or a deployment service to get each of the images for the services they've created they can now simply run `docker run jackmckew/multi-docker-client` and that's it! It should run on any operating system provided Docker is installed, how cool is that!

## Deploying to AWS Elastic Beanstalk

Now we want to deploy this application to Elastic Beanstalk, that means we need to create a `Dockerrun.aws.json` which is very similar to that of the `docker-compose.yml`. The contents of the json file will be:

``` json
{
    "AWSEBDockerrunVersion": 2,
    "containerDefinitions": [{
            "name": "client",
            "image": "jackmckew/multi-docker-client",
            "hostname": "client",
            "essential": false,
            "memory": 128
        },
        {
            "name": "server",
            "image": "jackmckew/multi-docker-server",
            "hostname": "api",
            "essential": false,
            "memory": 128
        },
        {
            "name": "worker",
            "image": "jackmckew/multi-docker-worker",
            "hostname": "worker",
            "essential": false,
            "memory": 128
        },
        {
            "name": "nginx",
            "image": "jackmckew/multi-docker-nginx",
            "essential": true,
            "portMappings": [{
                "hostPort": 80,
                "containerPort": 80
            }],
            "links": [
                "client", "server"
            ],
            "memory": 128
        }
    ]
}
```

Now provided we've set up the following:

- RDS - Redis
- ElasticCache - PostgreSQL
- VPC - Security Group
- Initialized all the environment variables in the EB instance

We should be able to push to Github and see our application be deployed!
