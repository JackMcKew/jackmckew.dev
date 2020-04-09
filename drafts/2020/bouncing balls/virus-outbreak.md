Title: Virus Spreading - Part 1
Date: 2020-04-09
Author: Jack McKew
Category: Javascript, Data Visualisation
Tags: javascript, data-viz
Stylesheets: virus_part_1.css
JavaScripts: virus_part_1.js, dat.gui.js

Let's try and simulate how transmission can spread throughout a community and implement a variety of different parameters to see how these affect the simulation.

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