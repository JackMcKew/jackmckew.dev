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

If you have read my blog previously, I did a post on answering the question "How many words have I written in this blog?" which you can reach at: [https://jackmckew.dev/counting-words-with-python.html](https://jackmckew.dev/counting-words-with-python.html).

This was great, I had wrote 2 functions which count how many words were inside markdown files & Jupyter notebooks. Following this, I had a great idea, why not make a 'ticker' on this website which increments each time a new post goes up.