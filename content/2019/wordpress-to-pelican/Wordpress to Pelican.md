Title: Migrating from Wordpress to Pelican
Date: 2019-12-20 06:30
Category: Software Development, Python
Author: Jack McKew
Tags: python
Slug: migrating-from-wordpress-to-pelican

For some time now I have been wanting to move away from Wordpress, due to my specific case of wanting to embed custom HTML and JavaScript code snippets to enable interactive data visualisation. Furthermore my previous workflow of posts was disjointed in which I would develop the code in a Jupyter notebook, sometimes even writing the post in markdown within the notebook, then copying all of this out of the notebook into a Wordpress post and fiddling around with formatting for much too long. 

What tipped me over the edge was when I was looking back on previous posts (as this blog is mainly for storing previous projects, concepts and ideas), I was finding that I would go through the post and then have no idea whatsoever on where the project actually lived, this had to be fixed.

I started noticing more and more people online had moved to [Github Pages](https://pages.github.com/), which is primarily used with Jekyll. This rabbit hole went on as follows:

1. Static served websites (generate HTML pages and serve them)
2. Numerous static site generators:
   1. Jekyll,
   2. Hugo,
   3. VuePress
   4. Pelican
   5. [So on](https://www.staticgen.com/)