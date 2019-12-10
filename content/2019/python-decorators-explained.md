Title: Python Decorators Explained
Date: 2019-05-24 06:30
Category: Python
Author: Jack McKew
Tags: python
Slug: python-decorators-explained
Status: published

Python decorators are one of the most difficult concepts in Python to grasp, and subsequently a lot of beginners struggle. However they help to shorten code and make it more 'Pythonic'. This post is going to go through some basic examples where decorators can shorten your code.

Firstly you have to understand functions within python:

``` python
def hello(name='Jack'):
    return "Hello " + name

print(hello())
# output: 'Hello Jack'

greeting = hello
# assign a function to a variable, with no parentheses as we are not calling it

print(greeting())
# output: 'Hello Jack'

del hello
print(hello())
# output: NameError

print(greeting())
# output: 'Hello Jack'
```

As we can see above we can give functions default arguments (the string 'Jack' for the name variable in hello). Assign functions to variables (ensuring the parentheses are not included otherwise we would be assigning to the returning value from the function. Remove previous functions now that we have 'copied' the function over.

Now to take the next step into functions within Python, by defining functions within functions:

``` python
def hello(name='Jack'):
    print("You're now inside the hello() function")
    def greeting():
        return "Now you are in the greeting() function"
    def welcome():
        return "Now you are in the welcome() function"
    print(greet())
    print(welcome())
    print("You are now back in the hello() function"
hello()
# outputs: "You're now inside the hello() function"
#          "Now you are in the greeting() function"
#          "Now you are in the welcome() function" 
#          "You are now back in the hello() function"

welcome()
# output: NameError: name 'welcome' is not defined
```

Now we can make nested functions (functions within functions), the next step is, functions returning functions.

``` python
def hello(name='Jack'):
    def greeting():
        return "Now you are in the greeting() function"
    def welcome():
        return "Now you are in the welcome() function"
    if(name == 'Jack'):
        return greeting
    else:
        return welcome

returned_function = hello()
print(returned_function)
# output: <function greeting at 0x7f2143c01500>

# This clearly shows that the returned function is the greeting() function within the hello() function

print(returned_function()):
# output: "Now you are in the greeting() function"
```

From earlier, we know that if we don't include the parentheses then the function does not executed. Another extension of the way this is formatted is that we can now call hello()() which outputs "Now you are in the greeting() function".

``` python
def hello(name="Jack"):
    return "Hello " + name

def preFunction(function):
    print("This is the prefunction function")
    print(hello())

preFunction(hello)
# output: "This is the prefunction function"
#         "Hello Jack"
```

Now you have all the knowledge to learn what decorators really are, they let you execute code before and after a function. The code above is actually a decorator, but let's make it more usable.

``` python
def new_decorator(function):
    def functionWrapped():
        print("This is the pre function")
        function()
        print("This is the post function")
    return functionWrapped

def function_requiring_decoration():
    print("I need some decorations!")

function_requiring_decoration()
# output: "I need some decorations"

function_requiring_decoration = new_decorator(function_requiring_decoration)
# Now our function is wrapped by functionWrapped()

function_requiring_decoration()
# output: "This is the pre function"
#         "I need some decoration"
#         "This is the post function"
```

Now you've made a decorator! We've just used what we learned previously to modify it's behaviour in one way or another. Now to make it even more concise we can just the @ symbol. Here is how we could have used the previous code with @ symbol.

``` python
@new_decorator
def function_requiring_decoration():
    print("I need some decorations!")

function_requiring_decoration()
# output: "This is the pre function"
#         "I need some decoration"
#         "This is the post function"

# The @ operator is a short way of saying:
function_requiring_decoration = new_decorator(function_requiring_decoration)
```

Hopefully now you are ready to go and explore the world of -decorators within Python, they can be used quite powerfully and allow for you to reuse code and extend capabilities. Some of the best examples for decorators are for authentication or logging, however I will not cover them as they are extensively documented over the internet.
