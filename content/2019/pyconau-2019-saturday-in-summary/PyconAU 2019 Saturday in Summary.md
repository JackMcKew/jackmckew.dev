Title: PyCon AU 2019 Saturday In Summary
Date: 2019-08-06 06:30
Category: Python
Author: Jack McKew
Tags: pyconau, python
Slug: pycon-au-2019-saturday-in-summary
Status: published

My first ever conference, learning things I'd never even think of, meeting lots of new people and making my to-do list full of new things to learn. All this happened over the weekend at [PyConAU 2019](https://2019.pycon-au.org/). This post is dedicated to all the fantastic people I met that gave me new perspectives on python programming and all the amazing talks I had the pleasure of attending.

Please note that all the talks written about here were only the ones I was able to attend, there were many other amazing talks that I didn't get the opportunity to go to (will list the follow up ones later in the post) and would recommend to go through the youtube playlist of all the talks found here: <https://www.youtube.com/user/PyConAU>. A link to all the talks and descriptions can also be found in the headings.

To make this post more digestible for the reader (you!), I have broken into parts which are linked here:

-   Day 1 - How to communicate with businesses, metaclasses in python, making generative art, python applications in engineering, refactoring a large scale OSS project and the antipodean approach;
-   Day 1 - Lightning talks;
-   All the great ideas people gave me;
-   My further to-do list following day 1.

### Day 1

#### [Creating Lasting Change](https://2019.pycon-au.org/talks/aurynn) [\@aurynn](https://twitter.com/aurynn)

Day 1 kicked off with a keynote talk from [aurynn](https://github.com/aurynn), who spoke about the lessons learned from talking to your boss. My personal key takeaways were:

-   One word slides directs your focus to the talk rather than distracting,
-   Communicating with people outside your discipline, interest area, etc is made much easier if you put whatever the topic is from their perspective, particularly in the workplace, putting things in terms of risk as this is what matters to businesses.

#### [It's Pythons All The Way Down: Python Types & Metaclasses Made Simple](https://2019.pycon-au.org/talks/its-pythons-all-the-way-down-python-types-metaclasses-made-simple) [\@judy2k](https://twitter.com/judy2k)

Now classes are admittedly one of my weak points, so what better to do then go straight to metaclasses! My personal key takeaways were:

-   If you run dir() on a type, it'll tell you all the capabilities of that type (eg, dir(int) returns \[...,'\_\_add\_\_',...\]);
-   Complex numbers and functions have their own type in python;
-   Descriptors override attribute access;
-   There are two types of descriptors (data and non-data) where data descriptors are mutators;
-   Metaclasses can be used as blueprints for generating classes;
-   You can ensure classes are made appropriately with metaclasses.

#### [Pretty vector graphics - Playing with SVG in Python](https://2019.pycon-au.org/talks/pretty-vector-graphics--playing-with-svg-in-python) Amanda J Hogan

By feeding strings of text (which are instructions), you can generate graphics with SVG, mix this with loops and you get generative art! Art being generally a very visual process, watch the video to get a better understanding, personally I liked this one:

![amanda_hogan]({static img/image1.png})

#### [Python Applications in Infrastructure Planning and Civil Engineering](https://2019.pycon-au.org/talks/python-applications-in-infrastructure-planning-and-civil-engineering) [Ben Chu](https://au.linkedin.com/in/ben-chu-2643aa131)

As someone that works for a large engineering firm, this talk resonated with the possibilities of using python to automate jobs and get better results.

Firstly, Ben spoke about using Jupyter notebooks to make interactive reports for the environmental teams to utilise for their analysis and using papermill to export these into different formats (excel, pdf, etc).

Ben also used python to automate the verification stages of a proposed rail corridor location. By using [requests](https://2.python-requests.org/en/master/) & [beautiful soup](https://www.crummy.com/software/BeautifulSoup/bs4/doc/) to scrape the NSW development application website along with a machine learning classification algorithm ([XGBoost](https://xgboost.readthedocs.io/en/latest/)) for the developments impact on the rail corridor. Finally plotting this on an interactive map for the rail designers to use.

#### [How I auto-refactored a huge OSS project to use pytest](https://2019.pycon-au.org/talks/how-i-migrated-a-huge-oss-project-to-use-pytest) [\@craigds2](https://twitter.com/craigds2)

Craig gave a great talk about how he used PyBowler, Pytest and importantly pytest-sugar to automatically refactor existing testing framework for a huge open source project [GDAL](https://gdal.org/). This post has inspired me to do more testing & refactoring on my code as I develop things!

#### **[The Antipodes](https://2019.pycon-au.org/talks/brandon)** [\@brandon\_rhodes](https://twitter.com/brandon_rhodes)

Personally this talk really resonated with a habit that I have been trying to employ in my life recently. The basic principle being behind the meaning of the idea of [](https://en.wiktionary.org/wiki/antipodean)[antipodean](https://en.wiktionary.org/wiki/antipodean)s</a>, someone standing on the exact other side of the planet from you. I thought this was an amazing segway for moving to a new framework for structuring communications.

As most of us do, whenever replying to communication from someone, we normally start with me, me, me, me, you. For example, if someone asked us to make a decision, typically & personally, I would start the reply with stating why I had got to the decision, finally ending the message with the decision and the next steps.

A technique that I have recently started employing on my messaging is writing as I normally would and before hitting send, moving what matters most to the reader (the decision) to the top, followed by next steps and then going through all the reasons why I possibly had made that decision.

### **[Saturday Lightning Talks](https://2019.pycon-au.org/talks/saturday-lightning-talks)**

Personally, I thought the most interesting lightning talk was about procedurally generating planets, modelling them in 3D and then trying to estimate if the climate on them <https://youtu.be/AJqcxEzRdSY?t=140>.

What I think was the crowd favourite, was the [History and Politics of Australian supermarkets and their mergers](https://youtu.be/AJqcxEzRdSY?t=1097). Definitely worth the watch.

### All the great ideas people gave me!

Shoutout to [\@davidjb\_](https://twitter.com/davidjb_) who made me aware of modern static html sites with using [Pelican](https://docs.getpelican.com/en/stable/) and [Netlify](https://www.netlify.com/). By using a repository to store all the content, you can use these tools in combination to make an automated workflow for a CMS (Content management system) for deploying a website. Will definitely be looking into this for this very website!

Shoutout to a guy (who doesn't have socials) that I met a pub that made me aware of [Singularity](https://singularity.lbl.gov/), an alternative to docker, will have to do further research and testing on this one, so watch this space!

Further to this, I was also made aware of the [Gitflow Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow), as using Git is admittedly one of my other weakpoints, so will definitely be trying to bring this principle into my development pipeline.

### My to-do list after Pycon Day 1

-   Write this blog post!
-   Look into [tilemill](https://tilemill-project.github.io/tilemill/),
-   Understand [mutable and immutable](https://medium.com/@meghamohan/mutable-and-immutable-side-of-python-c2145cf72747) better,
-   Learn what [super does in Python](https://realpython.com/python-super/),
-   Try make some generative art,
-   Looking into [papermill](https://papermill.readthedocs.io/en/latest/) + [jupyterlab](https://jupyterlab.readthedocs.io/en/stable/),
-   Have a go at using [XGBoost](https://xgboost.readthedocs.io/en/latest/) and text,
-   Get (much) better at testing with [pytest](https://docs.pytest.org/en/latest/),
-   Look into structuring python projects better,
-   Move this website to static html with [netlify](https://www.netlify.com/) and more,
-   Look into [singularity](https://singularity.lbl.gov/),
-   Look into [GitFlow Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow).


