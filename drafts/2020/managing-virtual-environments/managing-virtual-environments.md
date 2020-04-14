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

