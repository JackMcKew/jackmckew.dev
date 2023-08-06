Title: Logistic Regression with PyTorch
Date: 2023-08-06
Author: Jack McKew
Category: Python, Data Science
Tags: python, visualisation, machine learning, ai

In this post we'll go through a few things typical for any project using machine learning:

1. Data exploration & analysis
2. Build a model
3. Train the model
4. Evaluate the model

While this is a very high level overview of what we're about to do. This process is almost the same in any size & complex machine learning project.

We'll be using the iris dataset, which is a very famous hello world dataset in machine learning which contains 4 parameters which describe three species of flower (the iris flower). The sepal length & width, and the petal length & width are provided for 50 samples of each species. The sepals of a lower are the green leafy parts surrounding the flower head (which has the petals).

We'll also be trying to classify flowers into their species from their attributes using the logistic regression model. Logistic regression predicts the probability that something is either one thing or not based on the input variables.

Let's take a look at our dataset visualised (below is how to produce this visual and an interactive version).

![logistic regression output]({static img/logistic-regression.png})

As always, we begin by importing the neccessary libraries/packages.

{% notebook 2023/hands-on-pytorch-logistic-regression/notebooks/hands-on-pytorch-logistic-regression.ipynb %}
