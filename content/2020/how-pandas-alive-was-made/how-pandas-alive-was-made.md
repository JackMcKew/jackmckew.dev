Title: How Pandas_Alive was Made
Date: 2020-06-26
Author: Jack McKew
Category: Python
Tags: Python

Pandas-Alive is an open source Python package for making animated charts from Pandas dataframes. This project was first inspired by a very specific COVID-19 visualisation, so I set out to make this visualisation a reality.

This visualisation consisted of a bar chart race showing regions, a line chart showing new cases by date, a line chart showing cumulative cases and a map chart showing cases by location.

Whenever starting a new project, it's always best to do some research to see:

- has this already been done?
- is there anything similar out there?
    - if so, what can you learn from the similar tool
- what architecture should this utilise

Pandas-Alive took inspiration from [Pandas-Bokeh](https://github.com/PatrikHlobil/Pandas-Bokeh), a Python package which is absolutely magic for making interactive charts from dataframes. For bar chart races in particular, Pandas alive took inspiration from [bar_chart_race](https://github.com/dexplo/bar_chart_race). This enables us to build and extend the work of others, so we're not running into the same problems that has already been solved.

## Architecture

It's always beneficial to consider what type of architecture or design pattern the overall project should use, as from experience it's painful to change architecture after starting.

A few design patterns seemed beneficial for this project such as

- factory
- templates
- facade

One of the biggest contributing factors to this decision, was that all these charts should have some shared functionality (they are all charts) and then each specific chart type has additional functionality. Due to this, the template design pattern was chosen, this would enable us to implement a base chart class for which all the other charts can inherit from, allowing access to common methods that all charts should have. While the decision of template may not be perfect, it's definitely worked out so far.

## Base Class

Now that we've decided to go with template design pattern, we need to implement the base chart class with the shared functionality. At this point, since there would be so many parameters going into the class constructor (`__init__`) in Python, it was frustrating having to put this information in two places.

Here is a basic example, but imagine if you had 10s of arguments (eg, name, species) and had to replicate this information so many times.

``` python
class Animal():
    def __init__(self, name='Animal',species='JackRussell'):
        self.name = name
        self.species = species
```

So once again, we research how someone else has already solved this problem, and we found attrs. Attrs allows us to create our classes and have the `__init__` and other dunder methods generated for us (see a previous post on dunder methods here).

This allows us to write the same class as above like:

``` python
@attr.s
class Animal():
    name: str = 'Animal'
    species: str = 'JackRussell
```

This will create the same class but initalise dunder methods for us!

I've written multiple posts on these topics which you can find:

- [Dunders](https://jackmckew.dev/dunders-in-python.html)
- [Class Inheritance](https://jackmckew.dev/inheritance-in-python.html)

Now we write the methods which all charts should share such as create figure, save, etc. We also create methods which will raise errors unless overridden, this is for future developers as a reminder to make sure that any classes that inherit from base chart ensure to override these methods with custom functionality. By having these methods shared, this allows us to change one part of code and have it ripple through the project. The benefit was definitely realised later on in version 0.2.0 where we could add in memory functionality to write to gif and not have to copy paste throughout the project.

## Chart Class

Now that we have a base class, let's make a class which inherits from base class and implements the functionality.

The first one typically takes the longest amount of time, and we refactored many times to move things around.

We can create new methods and parameters to extend the functionality of our base chart and make the magic happen.

## API

Now we need to make the interface between our users and the classes we've just created.

Taking inspiration from Pandas-Bokeh, using an accessor on pandas Dataframes allowing users to just call `df.plot_animated()` and have it work like magic.

This was actually quite straightforward to implement, thanks to the amazing work by contributors to the pandas project

See source code for this here: <https://github.com/JackMcKew/pandas_alive/blob/master/pandas_alive/__init__.py>

## Documentation

As a user of others projects, sifting through the documentation is where most of the time is spent. So we wanted to ensure documentation was friendly and up to date. To ensure this a few steps were made

- add docstrings to all functions
- generate documentation from docstrings with sphinx <https://jackmckew.dev/automatically-generate-documentation-with-sphinx.html>
- check all methods and classes have docstrings with interrogate

### Interrogate Action

Once interrogate was implemented to check all classes, methods and functions were captured by docstrings, we wanted to make sure that this was routinely checked. The best way to ensure this, is to automate it! Thus another project was started to create a GitHub action that uses interrogate.

For more information on GitHub actions and how to use them, check out a previous write up here: <https://jackmckew.dev/github-actions-for-cicd.html>

GitHub actions can be created from a Docker file, which spins up an instance of a specified container (we use alpine python in this case), install our dependencies and run the package. There was a bit of a hurdle in debugging the action and making sure the shell script was functional. The beauty of GitHub actions is then shown as we can string multiple actions together to get our workflow as we want it.

In the end the workflow for the interrogate action on the Pandas-Alive project was:

- Spin up Python container
- install dependencies (interrogate)
- run interrogate on project to check level of docstring coverage
- generate a new badge to show in the README
- commit this badge back to the repository if the level of coverage was met

This action is now available for anyone to use with GitHub actions <https://github.com/marketplace/actions/python-interrogate-check>.

## Tutorials

Everything anyone creates should come with instructions on how to use it, thus it is imperative to have tutorials on how to use something. In the beginning, this was a standalone Python file in the root of the repo, that would be copy pasted on each release into the README, this became undone when unexpectedly the copy paste was forgotten to be done. Thus we decided to have the README be a Jupyter notebook, which would both generate the examples and contain the source code for each example.

Further to this, why can't we include all this tutorials and examples in the documentation? This was a bit of a challenge to get working in the first place, but here is a previous write up on how this problem was tackled and solved: <https://jackmckew.dev/make-a-readme-documentation-with-jupyter-notebooks.html>.

## Conclusion

I'm very happy and proud of how Pandas-Alive turned out, and the amount of community response was outstanding as well (over 11,000 downloads in the first month). I built the visualisation I had set out to build, and is now an example in the tutorials. Got the opportunity to use Pandas-Alive on another project I was working on, which enabled me to produce a similar visualisation on another dataset in under an hour, which making this process as easy as possible was a goal I'd set for this project.

All in all, I believe this project has furthered my confidence in releasing open source software and I'm very happy with the result.
