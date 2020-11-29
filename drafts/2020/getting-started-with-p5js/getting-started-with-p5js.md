Title: Getting Started with P5.js
Date: 2020-11-xx
Author: Jack McKew
Category: Javascript, Data Visualisation
Tags: javascript, data-viz

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
