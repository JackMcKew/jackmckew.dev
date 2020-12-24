Title: Getting Started with P5.js
Date: 2020-12-25
Author: Jack McKew
Category: Javascript, Data Visualisation
Tags: javascript, data-viz

In this post we're going to make use of the library P5.js which enables us to create interactive visualisation in the browser. We're going to create an interactive pond where users will be able to click on the screen to create a new drop in the pond and watch it expand. As such not to have an empty screen, we'll also create a bunch of random drops that will consistently 'rain' down on our pond. There's even an interactive web editor for p5.js which is extremely useful for iterating through as we're creating something, this can be reached at: https://editor.p5js.org/.

There's a lot of special variable names that p5 defines for us such as `mouseIsPressed` for the state of if a user has clicked on the visualisation, or the functions `setup` and `draw` which do exactly as expected. We start by initializing a few global variables which will define how our visualisation will behave such as the number of drops, how big a drop should go before disappearing, how fast they'll expand and how big they'll start off as. After this we create an array of objects which each object represents a single raindrop to be displayed.

Next in the `draw` function, which is repeatedly called while the browser has the page open, we loop through all the objects in the array and draw a circle (ellipse with equal radii) and colour it according to how big it's radius is (this is as to watch it fade as it grows). We make use of the `stroke` function to define the colour of the lines for what we'll be drawing in that instance. If a drop has become too big we remove it from the array and add a new random drop, if it's still undersize we increase it's radius and colour.

Finally to add interactivity, we make use of the `mouseIsPressed` variable to determine if the user has clicked on the visualization and add a drop into the array at the X & Y position of where the user clicked.

<iframe src="https://editor.p5js.org/JackMcKew/embed/u2ga-k6rk"></iframe>

``` js
let drops = []
let totalDropSize = 100
let initialRadius = 1
let radiusIncrementMax = 1
let numberOfDrops = 50

function addRandomDrop() {
  drops.push(
      {
        x: random(0, width),
        y: random(0, height),
        radius: initialRadius,
        colour: 0
      }
    )
}

function setup() {
  createCanvas(400, 400);
  
  for(x=0; x < random(1, numberOfDrops); x = x + 1) {
      addRandomDrop()
  }
}

function draw() {
  background(255);
  
  if(drops.length > 0) {
  for (i = 0; i < drops.length; i++) {
      stroke(drops[i].colour)
      ellipse(drops[i].x, drops[i].y,drops[i].radius)
      if(drops[i].radius < totalDropSize) {
        drops[i].radius += random(1, radiusIncrementMax)
        drops[i].colour += 10
      } else {
        drops.splice(i, 1);

        addRandomDrop();
      }
    }
  }
  
  if(mouseIsPressed) {
    drops.push(
      {
        x: mouseX,
        y: mouseY,
        radius: initialRadius,
        colour: 0
      }
    )
  }
  
  
}
```
