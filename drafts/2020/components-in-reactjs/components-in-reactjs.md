Title: Components in React.js
Date: 2020-07-xx
Author: Jack McKew
Category: Javascript
Tags: javascript

To put it simply, components are the building blocks that make up the app in React.js. A component more specifically is a JavaScript class or function that optionally accepts inputs (aka properties or props) and returns a React element that describes how a section of the interface should appear.

In this post let's break down the general structure of a React component. More specifically this will also include using `react-redux` for state management in the browser and `react-router-dom` for handling dynamic routing. These can both be installed through `npm`.

Let's try to building a component which will represent a landing page on our React app with `create-react-app`. We will also want to show a different page whether the user is logged in or not, so our `Landing` component will take an input of (aka prop) of `isAuthenticated`.

> We won't be going into how the interface in App.s is created nor how isAuthenticated is handled outside the component in this post.

Let's create a file `Landing.js` (similarly could be named `Landing.jsx` for react specific file extension, `Landing.ts` for TypeScript or `Landing.tsx` for both react specific extension with TypeScript). This is followed by by importing all the necessary requirements for our javascript file.

## Import Requirements

``` js
import React from "react";
import { Link, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
```

The first line is to import React library, while this isn't used explicitly in the remaining code we will write, it will not work without it. This is due to when the code is transpiled into JavaScript, it'll then used React directly with `React.createElement()`. 

Next up is `Link` and `Redirect`, note the curly braces around these, this is known as destructuring, meaning we only want to take the two classes from the library. This method is useful for making more readable code when dealing with objects. `Link` is `react-router-dom`'s class for creating anchor tags (aka <a/> in HTML), and similarly `Redirect` is as you'd expect, a class to dynamically redirect to another route.

`connect` is a function that connects a React component to a Redux store. Consider a redux store as the immutable (can't be changed after creation) state of the application. The only way to change the state of the store is to dispatch an action, which is typically handled by a reducer.

`PropTypes` is a way of implementing runtime type checking for React props. If TypeScript is used for the project, this is somewhat extra type checking, which we can never have enough of!

## The Component

Now that we've imported everything that we need, it's time to actually create the component! A component in React is a function, where the props are the inputs and the element to be rendered is the return statement. We do this with an arrow function (aka Lambda function) for clarity.

```js
const Landing = ({ isAuthenticated }) => {
    if(isAuthenticated){
        return <Redirect to="/user-profile" />
    }

    return (
        <div className="homepage">
            <h1 className="site-title">
                An Awesome Landing Page
            </h1>
            <div className="buttons">
                <Link to="/register">
                    Sign Up
                </Link>
                <Link to="/login">
                    Log In
                </Link>
            </div>
        </div>
    )
}

Landing.propTypes = {
    isAuthenticated: PropTypes.bool,
}
```

`const` signifies our function is immutable, in that it can't be changed after it's been created. Next we deconstruct the argument of `isAuthenticated` from the function argument as we are expecting the function to be called with an object. If the user is logged in, then redirect them to their profile and if not, return a HTML `div` which contains all the elements as required. Note that `className` is used over `class` to denote CSS mark up as in JavaScript `class` is a keyword which can lead to unwanted behaviour.

Following this we add an object to our function which denotes the types of the arguments which should be expected in the function call. If we wanted to ensure that `isAuthenticated` is always passed, this is done by using the `isRequired` property, resulting in: `isAuthenticated: PropTypes.bool.isRequired`.

## Prop Types & Connect

Lastly we must define how our component is to interact with the redux store and export the function such that it can be used in other files. Since the component is dependant on what the state of the application is, we need to create a function which will map the state to the relevant prop, which we aptly name `mapStateToProps`.

> This post is not intended to go through how to set up the redux store or interactions with it.

```js
const mapStateToProps = (state) => ({
    isAuthenticated: state.auth.isAuthenticated,
})

export default connect(mapStateToProps)(Landing)
```

`mapStateToProps` is a function that takes in the current state of the application, and deconstructs the relevant element to use. `connect` is a wrapper function, so when it's called with `connect(mapStateToProps)` it returns another function which we can then use to pass our component into.

## Conclusion

Now we can use the statement `import Landing from './Landing'` and use our component similar to that of `Link` in our app!