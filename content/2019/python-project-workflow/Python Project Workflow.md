Title: Python Project Workflow
Date: 2019-08-30 06:30
Category: Python, Principles
Author: Jack McKew
Tags: python
Slug: python-project-workflow
Status: published

This post will go through my personal preference on project structure and workflow for creating a new project and an insight how I work on my projects from a development point of view. I will go from the very start as if I did not have Python/Git installed on my machine whatsoever.

First of all, we need to get Python! Head over to <https://www.python.org/downloads/> to get the version of Python you need (or default to the latest Python 3 stable release). For version control in my projects, I also like to use Git so, head on over to <https://git-scm.com/downloads> to download Git for your operating system.

Now once these are installed (if you put them in the default location), Python will default to be located in: C:\\Users\\Jack\\AppData\\Local\\Programs\\Python\\Python37-32. For the next few steps to ensure we are setting up virtual environments for our projects open command prompt here if you are on windows. This will look something like this:

![image-11.png]({static img/image-11.png})

The 'cd' command in windows (and other OS) stands for change directory, follow this with a path and you will be brought to that directory. Next whenever I first install Python I like to update pip to it's latest release, to do this use the command in this window:

``` bash
python -m pip install --upgrade pip
```

With pip upgraded to it's current release, it's time to install some very helpful packages for setting up projects: virtualenv and cookiecutter. To install these navigate to the the Scripts folder within the current directory with cd ('cd Scripts') and run 'pip.exe install virtualenv cookiecutter', pip will then work it's magic and install these packages for you.

If you take a peek into the Scripts folder now in your Python directory, it'll look a little like this:

![image-2.png]({static img/image-2.png})
Now something that I personally like to do is add this folder to your system environment variables in Windows so it's much easier to run any packages in your root Python installation on your PC. To do this:

1.  type in 'system environment' into the search command
2.  select environment variables from the bottom right corner
3.  edit system (or user) path variable
4.  browse and select the Scripts directory in your Python installation

If you chose to do this step, you will now be able to create virtual environments and cookiecutter templates without having to specify the directory to the executables.

It's now time to create a project from scratch. So navigate to where you like to keep your projects (mostly mine is in Documents\\Github\\) but you can put them anywhere you like. Now run command prompt again (or keep the one you have open) and navigate to the dedicated folder (or folders) using cd.

For most of my projects lately being of data science in nature, I like to use the cookiecutter-data-science template which you can find all the information about here: <https://drivendata.github.io/cookiecutter-data-science/>. To then create a project it is as simple as running:

``` bash
cookiecutter https://github.com/drivendata/cookiecutter-data-science
```

![image-3.png]({static img/image-3.png})

Provide as much information as you wish into the questions and you will now have a folder created wherever you ran the command with all the relevant sections from the template.

Whenever starting a new Python project, my personal preference is to keep the virtual environment within the directory, however this is not always a normal practice. To create a virtual environment for our Python packages, navigate into the project and run (if you added Scripts to your Path):

``` bash
virtualenv env
```

This will then initialise a folder within your current directory to install a copy of Python and all it's relevant tools with a folder ('env').

Before we go any further, this is the point that I like to initialise a git repository. To do this, run git init from your command line from within the project directory.

Now to finish off the final steps of the workflow that will affect the day-to-day development, I like to use pre-commit hooks to reformat my with black and on some projects check for PEP conformance with flake8 on every commit to my projects repository. This is purely a personal preference on how you would like to work, others like to use pytest and more to ensure their projects are working as intended, however I am not at that stage just yet.

To install these pre-commits into our workflow, firstly initialise the virtual environment from within our project by navigating to env/Scripts/activate.bat. This will activate your project's Python package management system and runtime, following this you can install packages from pip and otherwise. For our pre-commits we install the package 'pre-commit':

``` bash
pip install pre-commit
```

Following this to set up the commit hooks create a '.pre-commit-config.yaml' within your main project directory. This is where we will specify what hooks we would like to run before being able to commit. Below is a sample .pre-commit-config.yaml that I use in my projects:

``` bash
repos:
-   repo: https://github.com/ambv/black
    rev: stable
    hooks:
    - id: black
      language_version: python3.7
-   repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v2.3.0
    hooks:
    -   id: flake8
    -   id: check-yaml
    -   id: end-of-file-fixer
    -   id: trailing-whitespace
```

Now to install these, activate your virtual environment like above, navigate to the project directory and run 'pre-commit install'. This will install the pre-commit hooks within your git directory. Before going any further, I highly recommend to run 'pre-commit run --all-files' to both ensure pre-commit is working as expected and check if there is any project specific settings you may have to set.

On the default cookiecutter data science template with the settings as per above this will show on the pre-commit run (after you have staged changes in git (use git add -A for all)):

![image-4.png]({static img/image-4.png})

We can see a different opinions in code formatting appearing already from flake8's output. The black code formatter in Python's code length is 88 characters , not 79 like PEP8. So we will add a pyproject.toml to the project directory where we can specify settings within the black tool:

``` yaml
[tool.black]
line-length = 79
include = '\.pyi?$'
exclude = '''
/(
    \.git
  | \.hg
  | \.mypy_cache
  | \.tox
  | \.venv
  | \.docs
  | _build
  | buck-out
  | build
  | dist
)/
'''
```

For any flake8 specific settings (such as error codes to ignore), we can set a .flake8 file in the project directory as well, which may look like:

``` yaml
[flake8]
ignore = E203, E266, E501, W503, F403, F401
max-line-length = 88
max-complexity = 18
select = B,C,E,F,W,T4,B9
```

Finally we are able to run a commit to our project!

![image-5.png]({static img\image-5.png})
