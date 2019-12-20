Title: Inheritance in Python
Date: 2019-09-13 06:30
Category: Python
Author: Jack McKew
Tags: python
Slug: inheritance-in-python
Status: published

As Python is a high level, general purpose programming language, which supports users to define their own types using classes, which are most often following the concept of object-oriented programming. Object-oriented programming is a type of software design in which users not only define the data type (eg, int) of a data structure, but also the types of functions that can be applied.

Object-oriented programming is built up of a lot of concepts, to name a few:

-   Inheritance
-   Abstraction
-   Class
-   Encapsulation
-   so on

This post will cover an introduction to the concept of inheritance using Python and the animal kingdom.

First off, we are going to start by defining our 'base' class (also known as abstract class) of our Animal with common properties:

``` python
class Animal():
    def __init__(self, name='Animal'):
        self.name = name
    
    def family(self):
        print("Animal Kingdom")

    def speak(self):
        raise Exception("Not implemented yet (define speak)")

    def eat(self):
        raise Exception("Not implemented yet (define eat)")
```

Now that we have our base class, we can define a subclass 'Dog' that will be able to speak if we define the function inside, but we can also see that it derives from it's parent class 'Animal' by printing out it's family.

``` python
class Dog(Animal):
    def __init__(self, name='Animal'):
        super().__init__(name=name)

    def speak(self):
        print("Woof!")
        

dog = Dog("Jay")
dog.speak()
dog.family()
```

Which will print out:

``` python
Woof!
Animal Kingdom
```

See my post on dunders (double underscores) to get a better understanding of how the \_\_init\_\_ function is working: <https://jackmckew.dev/dunders-in-python.html>

Now we can define any subclass which can derive from our parent class 'Animal', or even more we can derive a class from 'Dog' and it will have all it's properties:

``` python
class JackRussell(Dog):
    def __init__(self, name='Animal'):
        super().__init__(name=name)

dog_2 = JackRussell('Jeff')
dog_2.speak()
dog_2.family()
```

Which will also print:

``` python
Woof!
Animal Kingdom
```

Now what if we wanted to specify the family that all of our dog classes are, we can do this by overriding their parent class (similar to how we are overriding the speak function):

``` python
class Dog(Animal):
    def __init__(self, name='Animal'):
        super().__init__(name=name)

    def family(self):
        print("Mammal")

    def speak(self):
        print("Woof!")
```

Which then when we run both the below code:

``` python
dog = Dog("Jay")
dog.speak()
dog.family()

class JackRussell(Dog):
    def __init__(self, name='Animal'):
        super().__init__(name=name)

dog_2 = JackRussell('Jeff')
dog_2.speak()
dog_2.family()
```

We will now get:

``` python
Woof!
Mammal
Woof!
Mammal
```

You should now be comfortable in understanding how inheritance works. Normally, it's best practice to inherit only from a single parent class when creating subclasses. As multiple inheritance makes your programs less complicated and easier to manage. However, for large programs, it is very difficult to avoid multiple inheritance.
