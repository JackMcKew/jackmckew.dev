Title: Decision Tree Classifiers in Python
Date: 2023-08-15
Author: Jack McKew
Category: Python, Data Science
Tags: python, visualisation, machine learning, ai

What are decision trees? It's a tool to assist with making decisions, in a tree like structure, similar to a flow chart; where each branch of the tree is a decision, usually made with some boundaries that decide which branch to follow. A basic decision tree could be of a coin flip, it has two branches which are heads or tails and thats it, the outcome is found at the end of the branch. Growing on this example, another decision tree could also be when you're trying to decide what to do for dinner.

![food decision tree]({static img/food-decision.jpg})

In this post we'll be using a decision tree to classify the species from the iris dataset, and we'll make a visualisation of the decision surface to see where the tree's boundaries are.

We'll be making use of:

- `sklearn` - a machine learning package
- `plotly` - a visualisation package

Let's start by importing all the neccessary packages

{% notebook 2023/decision-tree-classifier/notebooks/decision-tree-classifier.ipynb %}