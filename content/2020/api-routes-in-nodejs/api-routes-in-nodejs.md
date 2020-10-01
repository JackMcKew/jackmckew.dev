Title: API Routes in Node.js
Date: 2020-10-02
Author: Jack McKew
Category: Javascript
Tags: javascript

First off what's an API and more specifically what's an API route? API stands for Application Programming Interface, meaning it's how to communicate with the system you are creating. A route within an API is a specific path to take to get specific information or data out of. This post will dive into how to set up API routes in Nodejs with express.

We start by 'importing' express into our route and instantiating a router from the express library.

``` js
const express = require('express');
const router = express.Router();
```

Typically we group API routes together in standalone javascript files. For example, if our application needed authentication for users logging in, we could create an `auth.js` file which will contain all the API routes to do with authentication.

> We need to import express and instantiate the router in each of the standalone javascript files.

Next we can create routes as straightforward as using the corresponding method within `router`. Pending on the type of API that is being created, if you are using Express.js, it's mostly likely a web API and thus the methods follow HTTP method routes.

The primary or most-commonly-used HTTP methods are:

| Method Name | Operation | Description                                   |
| ----------- | --------- | --------------------------------------------- |
| POST        | Create    | Used for creating a new record of information |
| GET         | Read      | Used for retrieving information               |
| PUT         | Update    | Used for updating existing information        |
| DELETE      | Delete    | Used for deleting information                 |

These 4 methods make up the basic CRUD functionality (Create, Read, Update and Delete) of an application.

## POST

Let's create a scaffold `POST` method in node.js.

``` js
router.post('/',function(req,res) {
    res.send('POST request to homepage');
})
```

Similarly to do this asynchronously with arrow functions:

``` js
router.post('/',async(req,res) => {
    res.send('POST request to homepage');
})
```

As we can see above, the first argument to our API route method is the path, and the following is the callback function (what should happen when this path is hit). The callback function can be a function, array of functions, series of functions (separated by commas), or a combination of all of them. This is useful if you are wanting to do validation before the final POST request is made. An example of this is:

``` js
router.post('/',[checkInputs()], async (req, res) => {
    res.send('POST request to homepage and inputs are valid');
})
```

## GET

All the methods within Express.js follow the same principles so to create a scaffold `GET` request:

``` js
router.get('/',async (req, res) => {
    res.send('GET request to homepage');
})
```

## PUT

Similarly:

``` js
router.put('/',async (req, res) => {
    res.send('PUT request to homepage');
})
```

## DELETE

Similarly:

``` js
router.delete('/',async (req, res) => {
    res.send('PUT request to homepage');
})
```

## Express Middleware

All of the callback functions defined above are known as Middleware functions in Express.js. Middleware functions have access to 3 elements: `req`, `res`, and `next`.

| Argument | Use                                       |
| -------- | ----------------------------------------- |
| `req`    | HTTP request, named `req` by convention   |
| `res`    | HTTP response, named `res` by convention  |
| `next`   | The next middleware function to be called |

An example of using all of the arguments is:

``` js
router.get('/',async(req,res,next) => {
    console.log(req.body);
    res.send('GET request to homepage');
    next();
})
```

By piecing together many of these API routes (also known as endpoints) we can build a functional API that can drive our applications. For example, the application in the end may make a `GET` request to get all the latest posts by other users, and makes a `POST` request when you add a new post, and so on with all the different types of API routes.
