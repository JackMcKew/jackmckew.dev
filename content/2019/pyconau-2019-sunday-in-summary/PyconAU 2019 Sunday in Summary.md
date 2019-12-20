Title: PyCon AU 2019 Sunday In Summary
Date: 2019-08-07 06:30
Category: Python
Author: Jack McKew
Tags: python, pyconau
Slug: pycon-au-2019-sunday-in-summary
Status: published

This is a follow on from my last post [PyCon AU 2019 Saturday In Summary](https://jackmckew.dev/pycon-au-2019-saturday-in-summary.html).

[Day 2](https://2019.pycon-au.org/schedule/sunday/)
---------------------------------------------------

### [The real costs of Open Source Sustainability](https://2019.pycon-au.org/talks/vicky) [\@vmbrasseur](https://twitter.com/vmbrasseur)

The key takeaway that I got from this talk, was the typical reaction for problems which are far away from yourself or out of your control is to donate money. Vicky spoke about how sometimes money is not the solution to problems, specifically, for open source projects. Ways you can contribute can be summed up using the term Time, Talent, Treasure.

-   Time: you can donate your time to help a cause,
-   Talent: you can donate your skills and talents,
-   Treasure: you can donate your treasures.

### [Shipping your first Python package and automating future publishing](https://2019.pycon-au.org/talks/shipping-your-first-python-package-and-automating-future-publishing) [\@chriswilcox47](https://twitter.com/chriswilcox47)

Packaging has always been a bit of enigma to me, and Chris Wilcox did an excellent job at explaining not only the structure behind a package, but also how to ship a package. One thing that I have noticed to make sure is to ensure your project structure is in place, and [cookie cutter](https://cookiecutter.readthedocs.io/en/latest/) helps with this.

[Tox](https://tox.readthedocs.io/en/latest/) & [Nox](https://nox.thea.codes/en/stable/) can be used to automate testing of your package over multiple versions and distributions of Python, so you can reassure your users that the package will work no matter the environment.

### [It's dark and my lights aren't working (an asyncio success story)](https://2019.pycon-au.org/talks/its-dark-and-my-lights-arent-working-an-asyncio-success-story) [\@jim\_mussared](https://twitter.com/jim_mussared)

This was one of the talks that really resonated with my previous experience in my thesis project working with the ESP8266. Jim gave a very funny and relatable talk on the experience of using Zigbee communications to link the lights in a new home.

### [The universe as balls and springs: molecular dynamics in Python](https://2019.pycon-au.org/talks/the-universe-as-balls-and-springs-molecular-dynamics-in-python) [\@lilyminium](https://twitter.com/Lilyminium)

Jupyter notebooks can not only be used for developing, but also as presentations. Lily gave an in-depth talk about the analysis of molecular dynamics, presenting from a jupyter notebook which showed off the power of interactive visualizations making a very complex topic, simple and easy to understand.

### ["Git hook\[ed\]” on images & up your documentation game](https://2019.pycon-au.org/talks/git-hooked-on-images-up-your-documentation-game) [\@veronica\_hanus](https://twitter.com/veronica_hanus)

As another person that appreciates visual cues to what changes were made in the past, I can definitely see why using [Pyppeteer](https://pypi.org/project/pyppeteer/) to hook a screenshot onto a git commit can make a massive difference on going back to the commit history and be able to see exactly what changes were made.

[Sunday Lightning Talks](https://2019.pycon-au.org/talks/sunday-lightning-talks)
--------------------------------------------------------------------------------

Personally, I really appreciated the talk on <https://www.growstuff.org/>, a self proclaimed 'Tinder for Potatos'. Where users can put their plants they are growing & get a progress bar! Then they can interact with other growers, so possibly exchange and grow both the community and the plants. <https://youtu.be/q2VmIUaOS9o?t=9>

A few of the lightning talks really demonstrated how welcoming the Python & software community is. From [Fashion at PyConAU 2019](https://youtu.be/q2VmIUaOS9o?t=1385) showing how people can be their true self around a welcoming community to learning what it is like to be [Jewish at a conference](https://youtu.be/q2VmIUaOS9o?t=829). To quote [\@UrcherAus ,](https://twitter.com/UrcherAus)"And can come out, presenting as female in public for the very first time, and we say to you, ‘welcome to [\#pyconau](https://twitter.com/hashtag/pyconau?src=hashtag_click), I love your outfit’".

### All the great ideas people gave me!

Learning that Google has a monolithic "Monorepo", where they store all of their projects in one repository to alleviate the problems of maintaining multiple repositories for varying projects that all depend on each other.

Finding out that Blender has native support for Python scripting, and produces amazing renders. Very much so looking forward to finding some time to try out Blender and see if I can integrate Python and Blender. Watch this space for a future post on this topic!

### My to-do list after Pycon Day 2

-   ~~Write this blog post!~~ (Day 1),
-   Look into [tilemill](https://tilemill-project.github.io/tilemill/) (Day 1),
-   ~~Understand~~ [~~mutable and immutable~~](https://medium.com/@meghamohan/mutable-and-immutable-side-of-python-c2145cf72747) ~~better (Day 1),~~
-   ~~Learn what~~ [~~super does in Python~~](https://realpython.com/python-super/) ~~(Day 1),~~
-   Try make some generative art (Day 1),
-   Looking into [papermill](https://papermill.readthedocs.io/en/latest/) + [jupyterlab](https://jupyterlab.readthedocs.io/en/stable/) (Day 1),
-   Have a go at using [XGBoost](https://xgboost.readthedocs.io/en/latest/) and text (Day 1),
-   Get (much) better at testing with [pytest](https://docs.pytest.org/en/latest/) (Day 1),
-   ~~Look into structuring python projects better~~ (Day 1),
-   Move this website to static html with [netlify](https://www.netlify.com/) and more (Day 1),
-   ~~Look into~~ [~~singularity~~](https://singularity.lbl.gov/) ~~(Day 1),~~
-   ~~Look into~~ [~~GitFlow Workflow~~](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) ~~(Day 1),~~
-   Have a go at using [Blender](https://www.blender.org/) (Day 2),
-   Try make and give a presentation with Jupyter (Day 2),
-   Try making a plot in [Plotly](https://plot.ly/) (Day 2),
-   Look into [Binder](https://mybinder.org/) for distributing code (Day 2),
-   Listen to [Python Bytes podcasts](https://pythonbytes.fm/) (Day 2).

### Talks to catch up on

-   ["Extracting tabular data from PDFs with Camelot & Excalibur" - Vinayak Mehta](https://www.youtube.com/watch?v=99A9Fz6uHAA&list=PLs4CJRBY5F1LKqauI3V4E_xflt6Gow611&index=5),
-   ["Using Dash by Plotly for Interactive Visualisation of Crime Data" - Leo Broska](https://www.youtube.com/watch?v=O1gvNeJlIs0&list=PLs4CJRBY5F1LKqauI3V4E_xflt6Gow611&index=7),
-   ["Using Python, Flask and Docker To Teach Web Pentesting" - Zain Afzal, Carey Li](https://www.youtube.com/watch?v=l0Sazyzs1IY&list=PLs4CJRBY5F1LKqauI3V4E_xflt6Gow611&index=16),
-   ["cuDF: RAPIDS GPU-Accelerated Dataframe Library" - Mark Harris](https://www.youtube.com/watch?v=lV7rtDW94do&list=PLs4CJRBY5F1LKqauI3V4E_xflt6Gow611&index=21),
-   ["3D Rendering with Python" - Andrew Williams](https://www.youtube.com/watch?v=3oAgsQji6m4&list=PLs4CJRBY5F1LKqauI3V4E_xflt6Gow611&index=28),
-   [Machine Learning and Cyber Security - Detecting malicious URLs in the haystack](https://www.youtube.com/watch?v=ZhvlfNi-0aY&list=PLs4CJRBY5F1LKqauI3V4E_xflt6Gow611&index=32),
-   [Tunnel Snakes Rule! Bringing the many worlds of Python together](https://www.youtube.com/watch?v=aeZOVaULoNI&list=PLs4CJRBY5F1LKqauI3V4E_xflt6Gow611&index=38),
-   ["Goodbye Print Statements, Hello Debugger!" - Nina Zakharenko](https://www.youtube.com/watch?v=HHrVBKZLolg&list=PLs4CJRBY5F1LKqauI3V4E_xflt6Gow611&index=40),
-   ["Insights into Social Media Data using Entropy Theory" - Mars Geldard](https://www.youtube.com/watch?v=lW5ZJcrjYLw&list=PLs4CJRBY5F1LKqauI3V4E_xflt6Gow611&index=59).
