Title: Packaging Python Packages with Poetry
Date: 2020-03-25
Author: Jack McKew
Category: Python
Tags: python

**Packaging Python code to easily share code with others!**

If you are using Python, you've most likely used pip, conda or similar to install packages from other developers such that you aren't reinventing the wheel. This functionality is by far one of my favourite features of the language. If you aren't already aware, (most) of these packages you install with pip live on [PyPI](https://pypi.org/), the Python Package Index.

This post is for how to structure a package in Python with [Poetry](https://python-poetry.org/) and publish it on [PyPI](https://pypi.org/) (I was amazed how easy this was).

## What is Poetry?

A quote from the creator of [Poetry](https://python-poetry.org/):

> I built Poetry because I wanted a single tool to manage my Python projects from start to finish. I wanted something reliable and intuitive that the community could use and enjoy. - Sébastien Eustace

In it's essence, [Poetry](https://python-poetry.org/) manages the Python project workflow so you don't have to.

Same as venv, virtualenv, conda create virtual environments for a project, [Poetry](https://python-poetry.org/) will also create a virtual environment to go with your project.

> If you are working in VS Code, the [Python extension](https://marketplace.visualstudio.com/items?itemName=ms-python.python) doesn't automatically detect the virtual environment location that Poetry defaults to. To tell VS Code where the virtual environments live for Poetry head to `Settings > python.venvFolders` and add `C:\\Users\\USERNAME\\AppData\\Local\\pypoetry\\Cache\\virtualenvs` for Windows.

## Package Structure

Python packages require a standard structure (albeit lenient), which [Poetry](https://python-poetry.org/) sets up for you when a project is initialized.  If we run `poetry new test_package` we will end up with the structure:

``` tree
test-package
+-- pyproject.toml
+-- README.rst
+-- test_package
|   +-- __init__.py
+-- tests
|   +-- __init__.py
|   +-- test_test_package.py
```

Inside the top directory of our package we have 2 folders and 2 files.
|File|Use|
|--|--|
|pyproject.toml|Contains all the information about your package, dependancies, versions, etc.|
|README.rst|Readme file as to what the project does, any instructions of use, etc (see [Pandas-Bokeh](https://github.com/PatrikHlobil/Pandas-Bokeh) for a great example).|
|test_package|This is where all our Python code will live for the project.|
|tests|Following test driven development, this is where any automated tests live to make sure the code runs as expected.|

### `__init__.py` Files

What are all these `__init__.py` files and what are they there for? To be able to import code from another folder, Python requires to see an `__init__.py` inside a folder to mark it as a package.

If we create a function inside our test_package folder:

``` tree
+-- test_package
|   +-- __init__.py
|   +-- function.py
```

Now users can use:
`import test_package.function`

or

`from test_package import function`

## Wordsum - My First Package

If you have read this blog previously, I did a post on answering the question "How many words have I written in this blog?" which you can reach at: [https://jackmckew.dev/counting-words-with-python.html](https://jackmckew.dev/counting-words-with-python.html).

This was great, I had wrote 2 functions which count how many words were inside markdown files & Jupyter notebooks. Following this, I had a great idea, why not make a 'ticker' of how many words have been written in this blog and display this on the website. Making sure that whenever a new post is added the 'word ticker' increments by how many words were in that post.

This in the inspiration behind [Wordsum](https://github.com/JackMcKew/wordsum) which is also available on [PyPI](https://pypi.org/project/wordsum/). Meaning you can install it with:

``` bash
pip install wordsum
```

### Wordsum Package Structure

To make the two functions more extensible, the two functions were further broken into smaller functions and contained in their own 'internal' package (folder).

The basic structure we ended up with was:

``` tree
wordsum
+-- word_sum.py
+-- __init__.py
+-- _file_types
|   +-- __init__.py
|   +-- jupyter.py
|   +-- markdown.py
+-- _io
|   +-- __init__.py
|   +-- read_files.py
+-- _util
|   +-- __init__.py
|   +-- file_locate.py
```

Now the `_` prefix to the folders is to nominate that functions contained in these folders are internal to the package. Meaning the user shouldn't be able to access these functions.

The main functions of the package are kept within `word_sum.py` (which uses the functions in the `_xxx` folders).

### User Interaction

To make the main functions within `word_sum.py` accessible to users of the package we can import them in the 'top' `__init__.py` of the wordsum package.

``` python
__version__ = '0.1.3'

from wordsum.word_sum import count_words
from wordsum.word_sum import list_supported_formats
from wordsum.word_sum import count_files
```

This will allow users to interact with the package like:

``` python
import wordsum

if __name__ == "__main__":
    print(wordsum.count_words('./example_files',['.md','.ipynb']))
    wordsum.list_supported_formats()
```

### Publishing to PyPI

Since we've used Poetry with the development of this package, our `pyproject.toml` should be a bit more fleshed out. Wordsum's `pyproject.toml` ended up as:

``` pyproject.toml
[tool.poetry]
name = "wordsum"
version = "0.1.3"
description = "Counting words within a folder of files recursively."
readme = "README.md"
repository = "https://github.com/JackMcKew/wordsum"
authors = ["JackMcKew <jackmckew2@gmail.com>"]

[tool.poetry.dependencies]
python = "^3.6"
mypy = "^0.770"
nbformat = "^5.0.4"
black = "^19.10b0"
flake8 = "^3.7.9"

[tool.poetry.dev-dependencies]
pytest = "^5.2"
black = {version = "^19.10b0", allow-prereleases = true}

[tool.poetry.urls]
issues = "https://github.com/JackMcKew/wordsum/issues"

[build-system]
requires = ["poetry>=0.12"]
build-backend = "poetry.masonry.api"
```

All that is left to do is to sign up for an account on PyPI and run:

``` bash
poetry publish
```

This will ask for your PyPI credentials, build the package (a step done by `setuptools` previously) and upload the package for you.

Now users can install your package with:

``` bash
pip install wordsum
```

## Integrating Wordsum Into This Website

Previously I've written a blog post on how I moved from Wordpress to Pelican ([https://jackmckew.dev/migrating-from-wordpress-to-pelican.html](https://jackmckew.dev/migrating-from-wordpress-to-pelican.html)). This goes into detail about how this site utilizes a continuous integration (CI) service (TravisCI), that rebuilds the site each time a new file is pushed to the GitHub repository. Following this, Netlify fires up and pushes the freshly built website out to the internet.

This site uses the theme [Flex](https://github.com/alexandrevicenzi/Flex) as a basis, except a local 'fork' of Flex is retained in the repository such that I can make edit without disrupting other users of Flex.

So there was only 3 files that I needed to edit: `pelicanconf.py`, `requirements.txt` and a html file for the theme. `pelicanconf.py` contains all the instructions to provide to pelican when building the site, `requirements.txt` contains the list of packages required for TravisCI to use and the template html file is how it is to represented on the web.

### Update `requirements.txt`

First off we add `wordsum` to the virtual environment for the project and freeze it within `requirements.txt` with 
``` bash
pip install wordsum
pip freeze requirements.txt
```

> Since most CI services use Ubuntu as a base, pywin32 is installed be default as a dependancy on wordsum, this can be removed with `pip uninstall pywin32`

### Update `pelicanconf.py`

This file contains the code that will run when `pelican content` is called upon the folder to build this website. To interface with `wordsum` we add the code:

``` python
import wordsum

WORD_TICKER = wordsum.count_words('./content',['.md','.ipynb'])
WORD_TICKER = f"{WORD_TICKER:,}"

```

This creates a variable `WORD_TICKER` that can be used later on to show the number of words counted across all markdown files & Jupyter notebooks.

> The line `WORD_TICKER = f"{WORD_TICKER:,}"` adds thousand separators to numbers in Python with f-strings. For example this converts 123456 to 123,456.