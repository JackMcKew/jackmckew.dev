[![Build Status](https://travis-ci.com/JackMcKew/jackmckew.github.io.svg?branch=master)](https://travis-ci.com/JackMcKew/jackmckew.github.io)

[![Netlify Status](https://api.netlify.com/api/v1/badges/f34d68b4-c1f0-457c-9274-cfa435a8958b/deploy-status)](https://app.netlify.com/sites/nifty-engelbart-ce3324/deploys)

# Jack McKew's Blog

[jackmckew.dev](https://jackmckew.dev) Powered by Pelican + Travis CI + Netlify

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
3. [Blogging with Jupyter notebooks](https://dev.to/shivbhosale/jupyter-notebooks-as-blogs-26l1)
4. [Concept of CI/CD](https://stackify.com/what-is-cicd-whats-important-and-how-to-get-it-right/)
5. [Travis CI](https://travis-ci.com/)
6. [Netlify](https://www.netlify.com/)

What I settled on was a bit of a concoction of services, such that I can both get my feet wet with these new tools and still stay in the land of snakes (Python).

## Pelican + Travis CI + Netlify + Github

Before we get into all 4 services in conjunction, let's separate and step through the process for each of them.

### Pelican

Right off the bat, the first milestone I wanted to hit was to be able to generate a locally hosted static site from a single post converted to markdown. Luckily, there is an exact guide for going through this process in the documentation for Pelican and using the tool pelican-quickstart.

[http://docs.getpelican.com/en/3.6.3/quickstart.html](http://docs.getpelican.com/en/3.6.3/quickstart.html)

#### Themes

The next step was to decide on a theme for the website, while the intentions were to develop a theme from scratch, I shall leave this for a later date. An easy way of previewing themes was the website:

[http://www.pelicanthemes.com/](http://www.pelicanthemes.com/)

Which lets you scroll through the various themes, and even links to the repository on github for the theme if you wish to use it. The theme I decided on was [Flex by Alexandre Vicenzi](https://github.com/alexandrevicenzi/Flex).

Apply the the theme was as simple as cloning the repo (or using [git submodules](https://www.atlassian.com/git/tutorials/git-submodule)), and adding one line of code in pelicanconf.py (generated automatically by pelican-quickstart).

```python
THEME = "./themes/Flex"
```

#### Plugins

Admittedly, I just tried out all the plugins in the [Pelican Plugins Repository](https://github.com/getpelican/pelican-plugins) until I found the combination that works for me, this ended up being:

```python
PLUGINS = [
    "sitemap",
    "better_codeblock_line_numbering",
    "better_code_samples",
    "bootstrapify",
    "deadlinks",
    "more_categories",
    "neighbors",
    "pelican-ert",
    "liquid_tags.notebook",
    "liquid_tags.include_code",
    "representative_image",
    "share_post",
    'show_source',
    'tipue_search',
    "dateish",
    "post_stats",
    "render_math",
    "autostatic",
    "clean_summary"
]
```

For tipue_search in particular, as this wasn't supported by the theme yet, I created a pull request on the original repository, with the functionality integrated [https://github.com/alexandrevicenzi/Flex/pull/193](https://github.com/alexandrevicenzi/Flex/pull/193).

#### Wordpress Import

Now that I had the skeleton of the website set up, I needed to bring in all the existing posts from wordpress. By following another guide within the Pelican documentation, this was a relatively simple task [http://docs.getpelican.com/en/3.6.3/importer.html](http://docs.getpelican.com/en/3.6.3/importer.html). However, I did spend the time to go through and edit each markdown to remove redundant 'wordpress' formatting tags manually.

#### Linking to Content

As one of the main tasks of this project was to consolidate articles with the content/code/analysis in one spot, initially in development following the guide in [http://docs.getpelican.com/en/3.6.3/content.html](http://docs.getpelican.com/en/3.6.3/content.html). 

```bash
content
├── articles
│   └── article.md
├── images
│   └── han.jpg
├── pdfs
│   └── menu.pdf
└── pages
    └── test.md
```

I ended up with a structure like above, which annoyed me a bit as now the content was in one place, but still divided into 3 folders with little-to-no link between them, my goal was to have the structure like:

```bash
content
├── articles
│   ├── test-article
│   |   ├── img
│   │   |	└── icon.png
│   │   |	└── photo.jpg
│   |   ├── notebooks
│   │   |	└── test-notebook.ipynb
│   │   └── article.md
└── files
    └── archive.zip
```

By using the plugins [autostatic](https://github.com/AlexJF/pelican-autostatic) & [liquid_tags](https://github.com/getpelican/pelican-plugins/tree/master/liquid_tags), I was able to achieve this structure.

### Travis CI

To be honest, I was actually surprised at how easy it was to turn Travis CI and that I could spin up a virtual machine, install all the dependencies and re-build the website. However, I had a lot of trouble trying to get Travis CI to push back to the repository such that Netlify could build from it.

This was later remedied by setting a repository secret variable on Travis CI as I couldn't get the secret token encrypted by Travis CI CLI (Ruby application).

In essence, all that was needed was a .travis.yml file in the root directory which ended up like this:

```bash
language: python
branches:
  only:
  - master
install:
- pip install --upgrade pip
- pip install -r requirements.txt
script:
- pelican content
deploy:
  provider: pages
  skip_cleanup: true
  github_token: $GITHUB_TOKEN
  keep_history: true
  local_dir: output
  on:
    branch: master
```

### Netlify

Admittedly, I feel as if I'm not using Netlify for all it can do.

Essentially, all for this project, it just detects a change in the gh-pages branch (for Github Pages), and redeploys the website out to a custom domain.

### Github

Github is the repository location for all the code, and I use Git for version control and interaction with the repository.

All I need to do now to create a new post is:

1. Push a new markdown file (and any other linked content) to the master branch of the repository,
2. This will fire up Travis CI to build the site with Pelican for me, 
3. Travis CI will then push the created site to the gh-pages branch of the repository,
4. Netlify will detect the change and process the new site,
5. The new site is deployed with updated posts!
