Title: Automatically Generate Documentation with Sphinx
Date: 2020-02-03
Author: Jack McKew
Category: Python, Software Development
Tags: python
Slug: automatically-generate-documentation-with-sphinx

## **Document code automatically through docstrings with Sphinx**

This post goes into how to generate documentation for your python projects automatically with Sphinx!

First off we have to install sphinx into our virtual environment. Pending on your flavour, we can do any of the following

``` bash
pip install sphinx
conda install sphinx
pipenv install sphinx
```

Once you have installed sphinx, inside the project (let's use the directory of this blog post), we can create a docs folder in which all our documentation will live.

``` bash
mkdir docs
cd docs
```

Ensuring to have our virtual environment with sphinx installed active, we run `sphinx-quickstart`, this tool allows us to populate some information for our documentation in a nice Q&A style.

``` bash
Welcome to the Sphinx 2.3.1 quickstart utility.

Please enter values for the following settings (just press Enter to
accept a default value, if one is given in brackets).

Selected root path: .

You have two options for placing the build directory for Sphinx output.
Either, you use a directory "_build" within the root path, or you separate
"source" and "build" directories within the root path.
> Separate source and build directories (y/n) [n]: y

The project name will occur in several places in the built documentation.
> Project name: SphinxDemo
> Author name(s): Jack McKew
> Project release []:

If the documents are to be written in a language other than English,
you can select a language here by its language code. Sphinx will then
translate text that it generates into that language.

For a list of supported codes, see
https://www.sphinx-doc.org/en/master/usage/configuration.html#confval-language.
> Project language [en]:

Creating file .\source\conf.py.
Creating file .\source\index.rst.
Creating file .\Makefile.
Creating file .\make.bat.

Finished: An initial directory structure has been created.

You should now populate your master file .\source\index.rst and create other documentation
source files. Use the Makefile to build the docs, like so:
   make builder
where "builder" is one of the supported builders, e.g. html, latex or linkcheck.
```

Now let's create an example package that we can write some documentation in.

``` bash
mkdir sphinxdemo
cd sphinxdemo
```

Then we create 3 files inside our example package:

``` bash
__init__.py
```

{% include_code 2020/documentation-with-sphinx/sphinxdemo/__init__.py :hidefilename: Package Init File %}

``` bash
__main__.py
```

{% include_code 2020/documentation-with-sphinx/sphinxdemo/__main__.py :hidefilename: Package Main File %}

``` bash
file_functions.py
```

{% include_code 2020/documentation-with-sphinx/sphinxdemo/file_functions.py :hidefilename: Package Functions File %}

> If you are using VS Code to use packages with debugging, change your launch.json with the following:
> "configurations": [
        {
            "name": "Python: Module - sphinxdemo",
            "type": "python",
            "request": "launch",
            "module": "sphinxdemo.`__main__`"
        }

To add documentation within our source code, we use docstrings. There are many available styles of docstrings out there, my personal preference is [Google Docstring Style](https://sphinxcontrib-napoleon.readthedocs.io/en/latest/example_google.html).

> We need to enable the napoleon sphinx extensions in docs/conf.py for this style to work.

The resulting documented code will look like:

``` bash
__init__.py
```

{% include_code 2020/documentation-with-sphinx/sphinxdemo_with_docs/__init__.py :hidefilename: Package Init File %}

``` bash
__main__.py
```

{% include_code 2020/documentation-with-sphinx/sphinxdemo_with_docs/__main__.py :hidefilename: Package Main File %}

``` bash
file_functions.py
```

{% include_code 2020/documentation-with-sphinx/sphinxdemo_with_docs/file_functions.py :hidefilename: Package Functions File %}

Now at a minimum our source code is documented, now to present these docstrings in a format that we can share with others (html).

First we need to set the sphinx configuration, the file which contains this (we generated with sphinx-quickstart) is located in `docs/source/conf.py`.

We are going to utilise the following sphinx extensions (they are all in-built into sphinx):

- [`sphinx.ext.autodoc`](https://www.sphinx-doc.org/en/master/usage/extensions/autodoc.html)
- [`sphinx.ext.napoleon`](https://www.sphinx-doc.org/en/master/usage/extensions/napoleon.html)
- [`sphinx.ext.viewcode`](https://www.sphinx-doc.org/en/master/usage/extensions/viewcode.html)
- [`sphinx.ext.autosummary`](https://www.sphinx-doc.org/en/master/usage/extensions/autosummary.html)

Our `conf.py` file for sphinx's configuration results in:

{% include_code 2020/documentation-with-sphinx/docs/source/conf.py Sphinx Configuration File %}

We must also set our index.rst (restructured text) with what we want to see in our documentation.

{% include_code 2020/documentation-with-sphinx/docs/source/index.rst Documentation Index File %}

> To generate individual pages for our modules, classes and functions, we define separate templates, these are detailed here: [autosummary templates](https://github.com/JackMcKew/jackmckew.dev/tree/master/content/2020/documentation-with-sphinx/docs/source/_templates)

Next we navigate our `docs` directory, and finally run:

``` bash
make html
```

This will generate all the stubs for our documentation and compile them into HTML format.

![Generated Docs]({static img/generated_docs.png})
