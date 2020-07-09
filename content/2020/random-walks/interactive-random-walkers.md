Title: Interactive Random Walkers with Javascript
Date: 2020-07-03
Author: Jack McKew
Category: Javascript, Data Visualisation
Tags: javascript, data-viz
Stylesheets: random-walkers.css
JavaScripts: random-walkers.js, dat.gui.js

Random walks are where randomly-moving objects move around, that's it. The most fascinating part about it is how many seemingly 'patterns' emerge from the random behaviour, and that everyone sees something different in the visualisations. In this post, let's build an interactive random walk visualisation with Javascript. Let's control the number of random walkers, the line thickness of each, the number of directions they can move (eg, 4 as seen in the GIF) and how fast they move.

If you get a cool pattern out of the visualisation, please share it in the comments!

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

The source code is provided below with comments which align with the steps above.

## Limitations on Directions

To be able to limit the angles that our walkers can move at, we need some methodology behind this. The concept that is implemented below that was landed on follows the steps:

1. Divide the total degree of freedom (360) by desired number of directions (eg, 4) `desired_number_of_directions = 4`
    1. This gives us a 'base' angle of 90 `base_angle = 360 / 4`
2. Iterate over the range to the number of directions (eg, [0,1,2,3,4])
3. Multiply our base angle by each iteration (eg, `2 * 90 = 180`)
4. Push onto a possible directions array (resulting array `possible_directions = [0,90,180,270,360]`)

> 0 & 360 is included in each possible directions array to give the walker a better chance at 'turning around' and staying on the canvas.

## Applications for Random Walk

*This is all well and good for making funky pictures, but what can this actually be used for?*

| Field    | Use                                                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Finance  | Model share prices & other factors, also known as the [random walk hypothesis](https://en.wikipedia.org/wiki/Random_walk_hypothesis) |
| Genetics | Genetic drift, the change in frequency of which genes are passed on or not                                                           |
| Physics  | Brownian motion, the movement of molecules in liquid & gases                                                                         |
| Ecology  | Model individual animal movements                                                                                                    |

There are many, many more applications for this, if you'd like to add to this list, leave a comment below!

> Vladimir Illevski has a number of articles on uses for random walks which you can find at <https://isquared.digital/blog/2020-04-12-random-walk/>.

Javascript Source(s):

- [random-walkers.js]({static js/random-walkers.js})
- [dat.gui.js]({static js/dat.gui.js})

CSS Source(s):

- [random-walkers.css]({static css/random-walkers.css})
