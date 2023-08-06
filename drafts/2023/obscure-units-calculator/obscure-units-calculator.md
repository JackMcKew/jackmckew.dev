Title: Obscure Units Calculator
Date: 2023-08-06
Author: Jack McKew
Category: Javascript, data science
Tags: javascript, data-science
Stylesheets: obscure-units.css
JavaScripts: obscure-units.js

Today we're going to go down a random thought, and build a obscure unit calculator, where you can referene a distance in the most obscure way possible!

> Above is GIF for sharing on social media, see the interactive version below.

<div id="controls-container">
    <label for="target-number">Enter target distance (in metres):</label>
    <input type="number" id="target-number" placeholder="Target distance (m)" />
    <br />
    <input
      type="submit"
      value="Find Combinations"
      onclick="findCombinations()"
    />
    <br />
    <table class="center">
      <thead>
        <tr>
          <th>Count</th>
          <th>Name</th>
          <th>Photo</th>
        </tr>
      </thead>
      <tbody id="table-body"></tbody>
    </table>
</div>

There's a few things we need to do to get this working (and you can see my working out in this repo!):

1. Scrape a bunch of distances for common objects, I chose animals from <https://www.dimensions.com/>
2. Format that data into a workable data structure (this included the biggest regex of my life)
3. Create an implementation of a greedy algorithm to return our results
4. Show this to the user!

Our greedy algorithm will be attempting to find a set of combinations which sum up to the input target, and to allow flexibilty with our dataset, I've opted to also allow the algorithm to use multiples of the input combinations, and for some variety, we use a random selection each time as our base.

To spice it up, I've also included Unsplash API to add images to the calculator to bring them to life, but sometimes this returns entirely different images, which I think adds to the fun.

The source code is provided below with comments which align with the steps above.

Javascript Source(s):

- [obscure-units.js]({static js/obscure-units.js})

CSS Source(s):

- [obscure-units.css]({static css/obscure-units.css})
