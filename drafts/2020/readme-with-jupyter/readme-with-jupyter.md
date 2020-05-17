Title: Make a README & Documentation with Jupyter Notebooks
Date: 2020-05-xx
Author: Jack McKew
Category: Python
Tags: python

README is typically the front page of a project, and should contain relevant information for current users & prospective users. As to make sure documentation across a project is consistent as well, imagine if we could include this README that is the front page of our project, both on the repository, and in the documentation. This post goes into how to set this workflow up. Find a live example of this being implemented on: <https://github.com/JackMcKew/pandas_alive>.

A good starting structure for a project's README is:

1. Intro - A short description & output (if applicable) of the project.

2. Usage - A section on how the project is to be used (if applicable).

3. Documentation - Link to documentation for the project.

4. Contributing Guidelines - If this is an open source project, a note whether contributions are welcome & instructions how to get involved is well received.

5. Changelog - Keeping a changelog of what is changing as the project evolves.

Other useful sections when applicable are requirements, future plans and inspiration.

## Inspiration for This Post

The inspiration for this post also comes from [Pandas_Alive](https://github.com/JackMcKew/pandas_alive), wherein there is working examples with output hosted on the README. Initially, this was contained in a `generate_examples.py` file and as the package evolved, the code to match the examples, was being copied over into code blocks in the `README.md`. If you can see where this is going, obviously whenever some new examples were made, the code to generate the examples was being forgotten to be copied over. This is very frustrating for new users to the package, as the examples simply don't work. Thus the workflow we go into in this post was adopted.

## README.ipynb

In projects, typically it's best practice to not have to repeat yourself in multiple places (this the DRY principle). In the README, it's nice to have working examples on how a user may use the project. If we could tie the original README with live code that generates the examples, that would be ideal, enter `README.ipynb`.

Jupyter supports markdown & code cells, thus all the current documentation in the `README.md` can be copied within markdown cells. Similarly, the code used to generate examples or demonstrate usage can then be placed in code cells. Allowing the author, to run the entire notebook, generating the new examples & verifying the examples are working code. Fantastic, this is exactly where we want to go.

Now if you only have the `README.ipynb` in the repository, GitHub will represent the file in it's raw form, JSON. For example would be hundreds of line like:

``` json
{
 "cells": [
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "# Pandas_Alive\n",
    "\n",
    "Animated plotting extension for Pandas with Matplotlib\n",
    "\n",
    "**Pandas_Alive** is intended to provide a plotting backend for animated [matplotlib](https://matplotlib.org/) charts for [Pandas](https://pandas.pydata.org/) DataFrames, similar to the already [existing Visualization feature of Pandas](https://pandas.pydata.org/pandas-docs/stable/visualization.html).\n",
    "\n",
    "With **Pandas_Alive**, creating stunning, animated visualisations is as easy as calling:\n",
    "\n",
    "`df.plot_animated()`\n",
    "\n",
    "![Example Bar Chart](examples/example-barh-chart.gif)"
   ]
```

This is not ideal whatsoever, this is nowhere near as attractive as the nicely rendered `README.md`. Enter `nbconvert`.

### README.ipynb -> README.md with nbconvert

`nbconvert` is a package built to convert Jupyter notebooks to other formats and can be installed similar to jupyter (eg, `pip install jupyter`, `pip install nbconvert`). See the documentation at: <https://nbconvert.readthedocs.io/en/latest/>.

Now let's check the [supported output types for nbconvert](https://nbconvert.readthedocs.io/en/latest/usage.html#supported-output-formats):

- HTML,
- LaTeX,
- PDF,
- Reveal.js HTML slideshow,
- Markdown,
- Ascii,
- reStructuredText,
- executable script,
- notebook.

`nbconvert` supports Markdown! Fantastic, we can add this step into our CI process (eg, [GitHub Action](https://github.com/JackMcKew/pandas_alive/blob/master/.github/workflows/update-readme.yml)). This will allow us to generate a new `README.md` whenever our `README.ipynb` changes.

> In Pnndas_Alive, we clear the output output of the cells in `README.ipynb` with the flags: `jupyter nbconvert --ClearMetadataPreprocessor.enabled=True --ClearOutput.enabled=True  --to markdown README.ipynb`.

#### Python Highlighting in Output

When first run, it was noticed that `nbconvert` wasn't marking the code blocks with the language (python). This is required to highlight the code blocks in the `README.md` with language specifics. The workaround for this, was to use `nbconvert`'s support for custom templates. See the docs at: <https://nbconvert.readthedocs.io/en/latest/customizing.html#Custom-Templates>.

The resulting template "pythoncodeblocks.tpl" was:

``` html
    {% extends 'markdown.tpl' %}
    {% block codecell %}
    ``` python
    {{cell.source}}
    ```
    {% endblock codecell %}

```

Which could be used with `nbconvert` with:

``` bash
jupyter nbconvert --template "pythoncodeblocks.tpl" --to markdown README.ipynb
```

## Integration into Documentation with Sphinx

If you haven't already, check out my previous post [Automatically Generate Documentation with Sphinx](https://jackmckew.dev/automatically-generate-documentation-with-sphinx.html). The post goes into detail on how to implement Sphinx as to generate all of the documentation for a project from docstrings automatically.

Before going on, the live site of the documentation in reference can be reached at: <https://jackmckew.github.io/pandas_alive/>

Now, we've:

1. Stored our working code & documentation for a our project's front page in a Jupyter notebook `README.ipynb`
2. Converted `README.ipynb` into markdown format with `nbconvert`
3. Inserted language specific (python) into the code blocks within the markdown

The next step is to make the README content also live in the documentation.

Since Sphinx relies on reStructuredText format, so we'll need to convert `README.md` to `README.rst`. Enter [`m2r`](https://github.com/miyakogi/m2r), a markdown to reStructuredText converter.

> `nbconvert` could be used in this step over `m2r`, in saying that this step was originally developed prior to the `README.ipynb` being created, thus only `README.md` existed. Please drop a comment if you try using `nbconvert` over `m2r` for this step and your results!

Firstly, `m2r` can be installed with pip (`pip install m2r`) and we can convert `README.md` with the command `m2r README.md` which will generate `README.rst` in the same directory.

Now we need to include our `README.rst` in the documentation. After much tweaking, the documentation structure set up landed upon for Pandas_Alive, with use of autosummary to automatically generate documentation from docstrings was:

> Autosummary generated documentation is included within a separate rst file (developer.rst) to nest all the generated with autosummary within one heading with the ReadTheDocs theme

[index.rst](https://github.com/JackMcKew/pandas_alive/blob/master/docs/source/index.rst)

``` reStructuredText

.. module:: pandas_alive

Pandas_Alive |version|
========================================

Animated plotting extension for Pandas with Matplotlib

:mod:`Pandas_alive` is intended to provide a plotting backend for animated matplotlib charts for Pandas DataFrames, similar to the already existing Visualization feature of Pandas.

With :mod:`Pandas_alive`, creating stunning, animated visualisations is as easy as calling:

``df.plot_animated()``

.. image:: ../../examples/example-barh-chart.gif
   :target: examples/example-barh-chart.gif
   :alt: Example Bar Chart

.. toctree::
   :caption: Getting Started

   Installation & Examples <README>


.. toctree::
   :caption: Developers

   developer

.. rubric:: Modules


Indices and tables
==================

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`

```

[developer.rst](https://github.com/JackMcKew/pandas_alive/blob/master/docs/source/developer.rst)

``` reStructuredText
API Reference
=============

.. autosummary::
   :toctree: generated

   pandas_alive.plotting.plot
   pandas_alive.plotting
   pandas_alive.base
   pandas_alive._base_chart
   pandas_alive.charts
   pandas_alive.__init__

```

[conf.py](https://github.com/JackMcKew/pandas_alive/blob/master/docs/source/conf.py)

## Integration with GitHub Actions

All the steps above mentioned are currently being used to maintain the project Pandas_Alive.

Find the GitHub Action yml files at: <https://github.com/JackMcKew/pandas_alive/tree/master/.github/workflows>

Find the Sphinx configuration files at: <https://github.com/JackMcKew/pandas_alive/tree/master/docs>
