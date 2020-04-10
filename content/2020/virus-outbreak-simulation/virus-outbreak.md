Title: Simulate Virus Outbreak with Javascript
Date: 2020-04-09
Author: Jack McKew
Category: Javascript, Data Visualisation
Tags: javascript, data-viz
Stylesheets: virus_part_1.css
JavaScripts: virus_part_1.js, dat.gui.js

This post will and simulate how viruses can spread throughout a community and implement a variety of different parameters to see how these affect the simulation. This is following on from last week's post on how to do a bouncing ball simulation with the canvas API [https://jackmckew.dev/pelican-and-javascript-bouncing-balls-in-canvas.html](https://jackmckew.dev/pelican-and-javascript-bouncing-balls-in-canvas.html).

> Below is a GIF for sharing on social media, see below for interactive visualisation.

> I am not an epidemiologist by any means of the word, this is entirely out of interest.

![Virus Outbreak GIF]({static img/virus-outbreak.gif})
 
Firstly, the extensions that are implemented on top of the bouncing ball simulation are:

- GUI controls for operating the simulation
- Area chart using Canvas API to show percentage of population healthy/infected/recovered.
- When a red ball hits a blue ball it'll attempt to transmit
- Following a specified period of time, the red ball will turn purple and will no longer transmit to other balls

The controllable elements of the simulation below are:

- Speed of balls
- Size (radius) of balls
- Number of balls allowed to move at any point in time
    - Simulate the effect of a lock down in the midst of outbreak
- Chance to transmit
    - Great for showing the effects of viruses if there is only a chance to transmit between population.
        - Respirators are normally named after their filter efficiency (eg, N95 is 95% efficient at collecting a specific size particle).
        - If you set the chance to transmit 5 (95% chance to block) then you'll simulate if everyone in a population wore a mask.
- Time to recover
    - Simulate if a virus took a different amount of time before recovering

Try the simulation out below and please comment any setting combinations you found interesting or if you have any more interesting parameters to simulate!

> The simulation depends on the size of the screen that you are looking at on this post, change some variables to see the impact!

<div id="simulation-block">
    <div id="tickers">
        <p id="timer"></p>
        <p id="infected_count"></p>
        <p id="healthy_count"></p>
        <p id="recovered_count"></p>
    </div>
    <div id="summary-block">
        <div id="controls-container"></div>
        <canvas id="area_chart" width="400" height="200" style="border: 2px solid grey;"></canvas>
    </div>
    <div id="ball-container">
        <canvas id="mycanvas" width="800" height="400" style="border: 2px solid grey;"></canvas>
    </div>

</div>

Javascript Source(s):

- [virus_part_1.js]({static js/virus_part_1.js})
- [dat.gui.js]({static js/dat.gui.js})

CSS Source(s):

- [virus_part_1.css]({static css/virus_part_1.css})