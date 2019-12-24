Title: Dunders in Python
Date: 2019-09-06 06:30
Category: Python
Author: Jack McKew
Tags: python
Slug: dunders-in-python
Status: published

A 'dunder' (double underscores) in Python (also known as a magic method) are the functions within classes having two prefix and suffix underscores in the function name. These are normally used for operator overloading (eg, \_\_init\_\_, \_\_add\_\_, \_\_len\_\_, \_\_repr\_\_, etc). For this post we will build a customized class for vectors to understand how the magic methods can be used to make life easier.

First of all before we get into the magic methods, let's talk about normal methods. A method in Python is a function that resides in a class. To begin with our Vector class, we initialise our class and give it a function, for example:

``` python
class Vector():

    def say_hello():
        print("Hello! I'm a method")
```

Now to call the method, we simply call the function name along with the Vector instance we wish to use:

``` python
Vector.say_hello()
```

This will print:

``` 
Hello! I'm a method
```

Now for our vector class, we want to be able to initialise it with certain constants or variables for both the magnitude and direction of our vector. We use the \_\_init\_\_ magic method for this, as it is invoked without any call, when an instance of a class is created.

``` python
class Vector():
    def __init__(self, *args):
        self.values = args
```

Now when we create an instance of our Vector class, we can give it certain values that it will store in a tuple:

``` python
vector_1 = Vector(1,2,3)

print(vector_1)
```

Which will print:

``` python
<__main__.Vector object at 0x03E90530>
```

But to us humans, this doesn't mean much more than we know what the name of the class is of that instance. What we really want to see when we call print on our class is the values inside it. To do this we use the \_\_repr\_\_ magic method:

``` python
class Vector():
    def __init__(self, *args):
        self.values = args
    def __repr__(self):
        return str(self.values)

vector_1 = Vector(1,2,3)

print(vector_1)
```

Which will print:

``` python
(1, 2, 3)
```

This is exactly what we want! Now what if we wanted to create a Vector, but we weren't sure what values we wanted to give it yet. What would happen if we didn't give it any values? Would it default to (0,0) like we would hope?

``` python
empty_vector = Vector()

print(empty_vector)
```

Which will print:

``` python
()
```

Not exactly how we need it, so we would need to run a check when the class is being initialized, to ensure that there are values being provided:

``` python
class Vector():
    def __init__(self, *args):
        if len(args) == 0:
            self.values = (0,0)
        else: 
            self.values = args
    def __repr__(self):
        return str(self.values)
```

Which when initialise an empty instance of our Vector now, it will create a (0,0) vector for us!

Now what if we wanted to be able to check how many values were inside our vector class? To do this we can use the \_\_len\_\_ magic method>:

```python
class Vector():
    def __init__(self, *args):
        if len(args) == 0:
            self.values = (0,0)
        else: 
            self.values = args
    def __repr__(self):
        return str(self.values)
    def __len__(self):
        return len(self.values)

vector_1 = Vector(1,2,3)

print(vector_1)
print(len(vector_1))
```

Which will print:

``` python
(1, 2, 3)
3
```

Hopefully this post has given you insight into how dunders/magic methods could be used to super power your classes and make life much easier!

You can find more information and examples about dunders in Python at: <https://docs.python.org/3/reference/datamodel.html#special-method-names
