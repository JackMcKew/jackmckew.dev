Title: Episode 14 - Types of Machine Learning
Date: 2019-02-22 06:33
Category: Machine Learning
Author: Jack McKew
Tags: machinelearning, ai
Slug: episode-13-types-of-machine-learning
Status: published

With AI and Machine Learning becoming the buzzwords in technology for 2018 and the real world applications now maturing to show the benefits of this technology. It can be very confusing when first entering the world of AI and machine learning with new techniques coming out every other day in search of improving the technology. Hopefully this article will help break down the barriers of the jargon and explain the types of machine learning algorithms out in the wild simplistically.

In general, there are 3 different broad categories that current machine learning algorithms fit into:

- Supervised learning
- Unsupervised learning
- Reinforcement learning

### Supervised Learning

Most practical machine learning algorithms use supervised learning. Supervised learning is where you have one or more input variables (x) and output variable(s) (y), and you use an algorithm to learn the mapping function from the input to the output.

``` latex
y = f(x)
```

The end goal of this algorithm is to approximate the mapping function accurately such that then you have a new data input (x), you can predict what the result (y) for that data would be.

The name supervised learning comes from the algorithm first learning from a training data set before we present the algorithm to a new data set. The training data set can be thought as the teacher who is supervising the learning process, and learning only stops when the algorithm reaches an acceptable level of performance on predicting the result.

### Unsupervised Learning

Unsupervised learning is when you only have the input variable(s) (x) and no respective output (y). The end goal for unsupervised learning is to model the distribution or structure of the data in order to discover and learn about the data set.

Unsupervised learning in contrast to supervised learning is where the omnipresent teacher in supervised learning is gone and there is no correct answers. The algorithm is left alone to discover and present the distribution/structure in the data that it determines.

### Reinforcement Learning

Reinforcement learning is the third broad category that a machine learning algorithm can fall into, where the algorithm has the input variable(s) (x) and through interacting with the input data set receives rewards for performing favoured actions.

Learning from interactions with the environment around us comes from our natural experiences in the world. For example, imagine you're a child in a room with a fire. You move closer to the fire and feel it's warmth and it makes you feel good, this is a positive reward; then you try a touch the fire and it burns you hand, this is a negative reward.

Reinforcement learning is just a computational approach to learning from interactions to achieve the most favourable result, in our example, we learnt that being close to the fire is a positive thing but too close is a negative thing so our result is to maintain a sufficient distance away to be warm but no burnt.
