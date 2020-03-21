Title: Hands On Machine Learning Chapter 1
Date: 2019-06-14 06:30
Category: Machine Learning
Author: Jack McKew
Tags: machinelearning
Slug: hands-on-machine-learning-chapter-1
Status: published

I've recently been making my way through the book "Hands-On Machine Learning with Scikit-Learn and Tensorflow", and thought I will put a summary of the chapter as a post, along with my personal answers to each of the chapter's exercises. The book in particular is published by O'Reilly and can be found <https://www.oreilly.com/library/view/hands-on-machine-learning/9781491962282/>.

Chapter 1 is around defining when and where to apply machine learning to a problem, as it is not always the best approach to solving a problem. Following, making sure to be aware of the strengths and weaknesses of each 'type' of machine learning systems. Types of machine learning systems can be broken into three broad categories:

- Is the model trained with human supervision? (supervised, unsupervised, semisupervised and reinforcement learning)
- Does the model learn incrementally on the fly or not? (online or batch learning)
- Does the model work by simply comparing new vs known data or detect patterns to build a prediction? (instance based or model based learning)

The book then goes into detail around these, I will not as many resources around these topics are abundantly available on the internet.

Chapter 1 also goes onto to detail the importance of defining the problem, 'clean' data, training vs testing data and comparing different techniques. From here on are the chapter 1 exercise questions, with my personal answer, and the book's answer.

> 1\. How would you define Machine Learning?
>
> <cite>My answer: Self-sufficiently improving on a technique.\
> Book's answer: Machine Learning is about building systems that can learn from data. Learning means getting better at some task, given some performance measure.</cite>
> 2\. Can you name four types of problems where it shines?
>
> <cite>My answer: Processes which either involve: many complex steps, steps that require 'tuning', ever-changing systems based on variables or to gain insight on a problem from a new perspective.\
> Book's answer: Machine Learning is great for complex problems for which we have no algorithmic solution, to replace long lists of hand-tuned rules, to build systems that adapt to fluctuating environments, and finally to help humans learn (e.g., data mining). </cite>
> 3\. What is a labeled training set?
>
> <cite>My answer: A data set with the associated desired answer.\
> Book's answer: A labeled training set is a training set that contains the desired solution (a.k.a. alabel) for each instance. </cite>
> 4\. What are the two most common supervised tasks?
>
> <cite>My answer: Regression and classification.\
> Book's answer: The two most common supervised tasks are regression and classification. </cite>
> 5\. Can you name four common unsupervised tasks?
>
> <cite>My answer: Association rule learning, anomaly detection, simplification and clustering.\
> Book's answer: Common unsupervised tasks include clustering, visualization, dimensionality reduction, and association rule learning. </cite>
> 6\. What type of Machine Learning algorithm would you use to allow a robot to walk in various unknown terrains?
>
> <cite>My answer; Reinforcement learning.\
> Book's answer: Reinforcement Learning is likely to perform best if we want a robot to learn to walk in various unknown terrains since this is typically the type of problem that Reinforcement Learning tackles. It might be possible to express the problem as a supervised or semisupervised learning problem, but it would be less natural. </cite>
> 7\. What type of algorithm would you use to segment your customers into multiple groups?
>
> <cite>My answer: k-neighbour clustering.\
> Book's answer: If you don’t know how to define the groups, then you can use a clustering algorithm (unsupervised learning) to segment your customers into clusters of similar customers. However, if you know what groups you would like to have, then you can feed many examples of each group to a classification algorithm (supervised learning), and it will classify all your customers into these groups .</cite>
> 8\. Would you frame the problem of spam detection as a supervised learning problem or an unsupervised learning problem?
>
> <cite>My answer: Supervised or semisupervised.\
> Book's answer: Spam detection is a typical supervised learning problem: the algorithm is fed many emails along with their label (spam or not spam). </cite>
> 9\. What is an online learning system
>
> <cite>My answer: A system that learns incrementally on the fly from new data.\
> Book's answer: An online learning system can learn incrementally, as opposed to a batch learning system. This makes it capable of adapting rapidly to both changing data and autonomous systems, and of training on very large quantities of data. </cite>
> 10\. What is out-of-core learning?
>
> <cite>My answer: Whenever the data set is too large to fit on a single machine.\
> Book's answer: Out-of-core algorithms can handle vast quantities of data that cannot fit in a computer’s main memory. An out-of-core learning algorithm chops the data into mini-batches and uses online learning techniques to learn from these minibatches.</cite>
> 11\. What type of learning algorithm relies on a similarity measure to make predictions?
>
> <cite>My answer: Instance based learning (comparison of new vs old).\
> Book's answer: An instance-based learning system learns the training data by heart; then, when given a new instance, it uses a similarity measure to find the most similar learned instances and uses them to make predictions.</cite>
> 12\. What is the difference between a model parameter and a learning algorithm’s hyperparameter?
>
> <cite>My answer: A model parameter directly influences and influenced by the way the model behaves, while a hyperparameter is dictates how the model should behave (eg, learn fast or slow).\
> Book's answer: A model has one or more model parameters that determine what it will predict given a new instance (e.g., the slope of a linear model). A learning algorithm tries to find optimal values for these parameters such that the model generalizes well to new instances. A hyperparameter is a parameter of the learning algorithm itself, not of the model (e.g., the amount of regularization to apply). </cite>
> 13\. What do model-based learning algorithms search for? What is the most common strategy they use to succeed? How do they make predictions?
>
> <cite>My answer: Relationships or trends within the data. Regression is used to find a possible solution to fit to the data and predictions are then extrapolated.\
> Book's answer: Model-based learning algorithms search for an optimal value for the model parameters such that the model will generalize well to new instances. We usually train such systems by minimizing a cost function that measures how bad the system is at making predictions on the training data, plus a penalty for model complexity if the model is regularized. To make predictions, we feed the new instance’s features into the model’s prediction function, using the parameter values found by the learning algorithm. </cite>
> 14\. Can you name four of the main challenges in Machine Learning?
>
> <cite>My answer: Quality, quantity, irrelevant sections and incorrectly modeled.\
> Book's answer: Some of the main challenges in Machine Learning are the lack of data, poor data quality, nonrepresentative data, uninformative features, excessively simple models that underfit the training data, and excessively complex models that overfit the data </cite>
> 15\. If your model performs great on the training data but generalizes poorly to new instances, what is happening? Can you name three possible solutions?
>
> <cite>My answer: Overfitted or underfitted to the data. Simplify the model, get more useful data and/or reduce noise.\
> Book's answer: If a model performs great on the training data but generalizes poorly to new instances, the model is likely overfitting the training data (or we got extremely lucky on the training data). Possible solutions to overfitting are getting more data, simplifying the model (selecting a simpler algorithm, reducing the number of parameters or features used, or regularizing the model), or reducing the noise in the training data. </cite>
> 16\. What is a test set and why would you want to use it?
>
> <cite>My answer: A test set is used to understand how your model interacts with unseen data without having to collect new information.\
> Book's answer: A test set is used to estimate the generalization error that a model will make on new instances, before the model is launched in production. </cite>
> 17\. What is the purpose of a validation set?
>
> <cite>My answer: To understand how accurate the system interfaces with unseen data.\
> Book's answer: A validation set is used to compare models. It makes it possible to select the best model and tune the hyperparameters. </cite>
> 18\. What can go wrong if you tune hyperparameters using the test set?
>
> <cite>My answer: The system has been specifically setup to perform under these conditions and may perform unexpectedly in new situations.\
> Book's answer: If you tune hyperparameters using the test set, you risk overfitting the test set, and the generalization error you measure will be optimistic (you may launch a model that performs worse than you expect). </cite>
> 19\. What is cross-validation and why would you prefer it to a validation set?
>
> <cite>My answer: By dividing the training set further into categories, then trained and validated against combinations of other categories.\
> Book's answer: Cross-validation is a technique that makes it possible to compare models (for model selection and hyperparameter tuning) without the need for a separate vali‐ dation set. This saves precious training data.</cite>
