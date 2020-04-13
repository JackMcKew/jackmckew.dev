Title: Interactive Random Walkers with Javascript
Date: 2020-04-13
Author: Jack McKew
Category: Javascript, Data Visualisation
Tags: javascript, data-viz
Stylesheets: random-walkers.css
JavaScripts: random-walkers.js, dat.gui.js

Random walks are where randomly-moving objects move around, that's it. The most fascinating part about it is how many seemingly 'patterns' emerge from the random behaviour, and that everyone sees something different in the visualisations. In this post, let's build an interactive random walk visualisation with Javascript. Let's control the number of random walkers, the line thickness of each, the number of directions they can move (eg, 4 as seen in the GIF) and how fast they move.

![Random Walkers GIF]({static img/random-walkers.gif})

> Above is GIF for sharing on social media, see the interactive version below.

<div id="controls-container"></div>
<div id="canvas-container">
    <canvas id="random-walk-canvas" height="400" width="400" style="border: 2px solid grey;">
        </canvas>
</div>

First off let's draft up the steps/concepts we will need to do to get this visualisation to work:

1. Prepare a canvas
2. Set the canvas size to be dynamic with the device the user is viewing on
3. Initialise a GUI for the user to change parameters (I recommend [dat.gui](https://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage))

4. Instantiate our walkers as objects within an array
5. Loop over the array, painting each walker on the canvas
6. Calculate the next position for each walker
7. Rinse repeat

Javascript Source(s):

- [random-walkers.js]({static js/random-walkers.js})
- [dat.gui.js]({static js/dat.gui.js})

CSS Source(s):

- [random-walkers.css]({static css/random-walkers.css})
