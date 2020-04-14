Title: Managing Virtual Environments on Windows
Date: 2020-04-14
Author: Jack McKew
Category: Python
Tags: Python

Managing virtual environments for Python on Windows was never straightforward in my experience. There is so many different tools available (which is fantastic!), it's difficult to find the right combination for Python projects. This post is for the combination of tools that work for my application, if there are any recommendations or improvements on this post, please let me know!

# The Tools

- [Pyenv-win](https://github.com/pyenv-win/pyenv-win)
- [Poetry](https://python-poetry.org/)
- [Virtualenv](https://virtualenv.pypa.io/en/latest/) (interchangeable with [venv](https://docs.python.org/3/library/venv.html))

Prior to using these tools, [Anaconda](https://www.anaconda.com/) was the go-to. Admittedly, the only reason to stop using was disk space. After using [Anaconda](https://www.anaconda.com/) on every project for a few months, around 30GB of space was being taken up for conda environments. As a lot of my projects involve using [Pandas](https://pandas.pydata.org/), [Gooey](https://github.com/chriskiehl/Gooey) & [PyInstaller](https://www.pyinstaller.org/), when packaging these executables up they would come out bigger than expected (250MB vs 25MB). This is a [well documented issue](https://stackoverflow.com/questions/43886822/pyinstaller-with-pandas-creates-over-500-mb-exe) across the internet.

# The Workflow

## Pyenv-win

[Pyenv](https://github.com/pyenv/pyenv) (specifically [pyenv-win](https://github.com/pyenv-win/pyenv-win)), is used in this workflow to manage multiple versions of Python. To make interfacing with pyenv-win & subsequent tools, let's include system environment variables. This let's us call for the enabled Python version executable & installed packages (virtualenv, poetry, etc) from anywhere on the PC. 

Firstly, let's set up a variable of where the pyenv-win installation lives as `PYENV`, which I placed in `C:\Users\%USER%\.pyenv\pyenv-win`. Followed by a variable which will hold the current version of Python that pyenv will use as `PYENV_VERSION`, the value of this variable will be dependant on the installed version folder name in `User/.pyenv/pyenv-win/versions/`, which is currently `3.8.1-amd64`. These are set up to use with the `PATH` variable, which is integrate with Windows and makes all files included in the paths listed in `PATH` available to anywhere on the PC.

The result is:

![Pyenv Variables]({static img/pyenv-variables.png})

Now we need to add in new variables to the `PATH` variable. The two variables we want to add are `%PYENV%\versions\%PYENV_VERSION%` and `%PYENV%\versions\%PYENV_VERSION%\Scripts`. This enables us to access both the python.exe & pip.exe of the selected version from anywhere, and then when we install packages with pip, we can access packages that have been installed. This ends up looking like:

![Path Variables]({static img/path-variables.png})

Following this, open command prompt, check that `python --version` matches the version variable selected, and then install packages required. The packages that I install are `virtualenv` & `poetry`. All project specific packages are installed in their own virtual environment (more on this below).

## Poetry



## Virtualenv