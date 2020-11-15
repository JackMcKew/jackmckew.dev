Here's a random animated bezier curve, still lots to go from here to get a river looking curve.

``` js
let xStart, yStart
let xCurrent, yCurrent
let xEnd, yEnd

function setup() {
  createCanvas(200, 200);
  xStart = 0;
  yStart = 0;
  xEnd = width;
  yEnd = height;
  
  xCurrent = xStart;
  yCurrent = yStart;
}

function draw() {
  background(255);
  noFill();
  stroke(0);
  beginShape();
  vertex(xStart, yStart)

  xCurrent = xCurrent + random(-10,10)
  yCurrent = yCurrent + random(-10, 10)
  bezierVertex(xStart, yStart, xCurrent, yCurrent, xEnd, yEnd)
  
  endShape();
  
  if(xCurrent > width) {
    xCurrent = 0
  }
  if(yCurrent > height) {
    yCurrent = 0
  }
}
```