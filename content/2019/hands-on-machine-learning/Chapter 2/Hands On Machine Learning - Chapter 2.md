Title: Hands On Machine Learning Chapter 2
Date: 2019-07-12 06:30
Category: Machine Learning
Author: Jack McKew
Tags: machinelearning
Slug: hands-on-machine-learning-chapter-2
Status: published

Chapter 2 is an end to end machine learning project, in which you pretend to be a recently hired data scientist for a real estate company. It cannot be emphasized enough that when learning about machine learning or any topic for that matter, it is best to actually experiment with real-world data and scenarios.

Firstly my personal opinion on how a machine learning (or data science) project is structured is a series of steps:

1. Get an understanding of the expected goal or outcome (eg frame the problem),
2. Get an understanding of the current process (if there is one),
3. Get the data behind the problem (or what you expect will be useful for solving the problem),
4. Explore and visualize the data to gain insights,
5. Prepare/massage the data ready for input into algorithms or models,
6. Select a model/algorithm and train it,
7. Tune your model/algorithm to the best you can,
8. Present the solution to the original stakeholder (take the stakeholder on a journey),
9. Launch, monitor and maintain your system.

I believe, that if you follow these steps at a minimum, you will find success with your data science/machine learning projects. This methodology also applies for any type of project and can be enhanced with tweaks where you see fit.

Anyway, back to Chapter 2, it is very much so reinforced that you should select an appropriate way of scoring performance of your algorithms/models (otherwise you can't compare them effectively). For regression tasks, generally the preferred performance measure is RMSE (Root Mean Square Error), but this may not always be the case depending on the context of the problem. For example, if the data set has many outliers (or outlier groups), it may prove beneficial to consider MAE (Mean Absolute Error).

Assumptions are in my opinion, the downfall of any collaborative project if they are not transparent or communicated. A practice that I personally do and recommend doing is to try your best to document every assumption you may make in a project, such that anyone later on can pick up where you were and understand why you chose to do something a certain way.

As per Chapter 1, it is again reinforced to split your data set up into a training set, a testing set and a validation set; albeit a more practical example of this concept in action. Whereas you use the K-fold validations with GridSearchCV to understand the best performing hyper parameters for your algorithm/model.

Personally, in Chapter 2, the most difficult part to understand is around the pipeline for preparing data ready for use in algorithms/models. Pipelines are essentially a sequence of steps that need to be completed in order before the data is ready. Stemming from the [Scikit-learn](https://arxiv.org/pdf/1309.0238v1.pdf) design principles, I found this the best way to understand the possible steps in a data preparation pipeline:

- Estimators
    - Any object that estimates parameters based on a data set is known as an Estimator. For example, if you had a data set with lots of missing values, you could estimate what to fill these gaps with an imputer, then you could choose to use the median of the dataset if appropriate.
- Transformers
    - Any object that transformers a data set is known as a Transformer. For example, if you wanted to now fill those gaps in the data set previously mentioned with the mean, you would use a transformer to 'insert' the median wherever empty values were found.
- Predictors
    - Any object that is capable of making predictions given a dataset is known as a Predictor. For example, a linear regression model is a predictor, using one feature to extrapolate another feature.
