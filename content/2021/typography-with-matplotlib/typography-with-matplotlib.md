Title: Typography With Matplotlib
Date: 2021-01-08
Author: Jack McKew
Category: Python
Tags: python, visualisation

Typography is 'the style and appearance of printed matter', so in this post we're going to make some typography art with `Matplotlib`, we're going to make use of some text and colour the words which are colours themmselves (eg, the colour red will be coloured red). This is an interesting dive into how to structure data to be processed. Before we get into how to create this, let's take a look at the output!

![typography output]({static img/typography.png})

Now to create the above image, we need some text, and that text would hopefully make use of worded colours more than once and in different colors. This site has lots of great examples, and we shall take an excerpt out of it <https://www.shortparagraph.com/paragraphs/paragraph-on-the-meaning-of-colours-by-anand/3221>.

To start off, we use a triple out, which denotes a multiline string in Python, this let's us use newlines (the enter key) throughout a single string.

{% notebook 2021/typography-with-matplotlib/notebooks/typography-with-matplotlib.ipynb %}
