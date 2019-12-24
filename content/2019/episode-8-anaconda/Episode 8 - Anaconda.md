Title: Episode 8 - Anaconda
Date: 2019-01-11 07:00
Category: Python
Author: Jack McKew
Tags: python
Slug: episode-8-anaconda
Status: published

Python is one of my favourite languages to develop in (if you haven't noticed yet). My favourite feature of Python is how easy it is to share your work with others and integrate other's code into your own projects. However as a project grows and gets older as time goes on it can be cumbersome to keep track of hundreds of dependencies that your project relies on to work. Even more so when all of these package dependencies are also being updated and changing functionality.

One elegant solution that I always use when first starting a new project is to use Anaconda (https://www.anaconda.com/). Anaconda is a free, easy-to-install package and environment manager for Python. It is very simple to use in that when you are starting a new project, you just need to create a new environment (within the Anaconda navigator) with the python version you wish to use and then activate it. Simple as that.

``` bash
conda create --name new_environment_name python=3.5 
```

In one single line, we have just created a new environment named "new\_environment\_name" and specified that this environment will use Python version 3.5. Now to activate the environment it is as simple as typing "activate new\_environment\_name".

``` bash
activate new_environment_name
```

Now to see what packages are contained within our newly created environment, or to ever see what packages and their versions are listed the command is:

``` bash
conda list
```

Now that we have created, activated and peeked inside our newly created environment we need to add some packages that we might use! This is as simple as the command "conda install PACKAGENAME", for example we might want to install matplotlib, a widely used data visualization package. Installing matplotlib into our environment is done by the command:

``` bash
conda install matplotlib
```

You will note that when this runs, it also asks to install all the dependencies that matplotlib relies on and will also notify you later when you have more packages that some might clash and need to be upgraded/downgraded so that all packages have a common version to work with.

With regards to working with certain version numbers of packages within an Anaconda environment, to install a specific version of a package, or even if you know what the minimum requirement is, can by following the table below:

| Constraint               | Specification          | Result                               |
| ------------------------ | ---------------------- | ------------------------------------ |
| Fuzzy                    | numpy=1.11             | 1.11.0, 1.11.1, 1.11.2, 1.11.18, etc |
| Exact                    | numpy==1.11            | 1.11.0                               |
| Greater than or equal to | "numpy>=1.11"          | 1.11.0 or higher                     |
| OR                       | "numpy=1.11.1\|1.11.3" | 1.11.1 or 1.11.3                     |
| AND                      | "numpy>1.8,<2"         | 1.8, 1.9, not 2.0                    |

By following these simple constraint rules, it is very easy to manage package version to maintain dependencies within your project without tearing your hair out when packages update and break your project.

Another major benefit of using Anaconda to manage your project's package dependencies is that when you're developing simultaneously with other projects and you may discover some bugs and wish to share them with your colleagues. To share all the dependencies (and their respective versions) with your colleague is as easy as generating an "environment file" and sharing the file with them so they have exactly the same environment as you. This is done by the following command:

``` bash
conda env export > environment.yml
```

Similarly, if you colleague sends you their "environment file", the command to reproduce their environment is (Please note that the name of the environment is encoded within the first line of the .yml file):

``` bash
conda env create -f environment.yml
```

In summary, Anaconda can be used to easily manage packages and dependencies across a project and fast track test/bug reproduction across multiple machines seamlessly. Personally, I would always advise to use a package manager across projects no matter the size.
