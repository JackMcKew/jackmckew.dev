Title: What is MicroPython?
Date: 2019-03-29 06:39
Author: admin
Category: Code Fridays
Slug: what-is-micropython
Status: published

<!-- wp:paragraph -->

From the MicroPython docs\
themselves *“MicroPython is a lean and efficient\
implementation of the* [*Python 3*](http://www.python.org/) *programming language that includes a small\
subset of the Python standard library and is optimised to run on\
microcontrollers and in constrained environments.”.* But what does all this mean? Python 3 is one of\
the most widely used, easy to write/read programming languages in the world\
that is rapidly growing. By default Python comes with a ‘standard library’\
which includes basic functions such as if statements, loops, printing, etc.

<!-- /wp:paragraph -->

<!-- wp:paragraph -->

Where MicroPython comes in is that the standard library for Python might\
take up valuable space/computations to run as efficiently it does on a PC, so\
MicroPython is a slice of the standard library that is able to run more\
efficiently and take up less space on a microcontroller (RAM and space is\
crucial when working with microcontrollers).

<!-- /wp:paragraph -->

<!-- wp:paragraph -->

MicroPython also comes with an interactive REPL (Read-Evaluate-Print Loop), which is an often overlooked amazing feature of MicroPython. The REPL allows you to connect to a microcontroller, execute code quickly without the need to compile or upload code. Which gives immediate feedback on whether your program is working as intended.

<!-- /wp:paragraph -->

<!-- wp:heading -->

**Differences between MicroPython & Python**
--------------------------------------------

<!-- /wp:heading -->

<!-- wp:paragraph -->

There\
obviously had to be some changes between Python and MicroPython to make it work\
efficiently on processors a fraction of the power, but what are they? If you\
are a beginner-intermediate Python programmer, you’ll only run into trouble in\
very specific scenarios, which can be easily worked around. For example you\
cannot delete from a list with a step greater than 1.

<!-- /wp:paragraph -->

<!-- wp:paragraph -->

**Sample\
Python Code**

<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"language":"python"} -->

``` {.wp-block-syntaxhighlighter-code}
L = [1,2,3,4]
del(L[0:4:2])
print(L)
```

<!-- /wp:syntaxhighlighter/code -->

<!-- wp:paragraph -->

You’d\
expect for the output here in Python normally to be:

<!-- /wp:paragraph -->

<!-- wp:table {"align":"center"} -->

  ------------------- -------------------------------------------------
  **Python Output**   **MicroPython Output**
  \[2,4\]             TypeError: object 'range' isn't a tuple or list
  ------------------- -------------------------------------------------

<!-- /wp:table -->

<!-- wp:paragraph -->

**Python\
Output                                   MicroPython\
Output**

<!-- /wp:paragraph -->

<!-- wp:paragraph {"align":"right"} -->

           \[2,4\]                                                     TypeError: object ‘range’ isn’t a tuple or list

<!-- /wp:paragraph -->

<!-- wp:paragraph -->

However\
this can be easily worked around with an explicit loop for example:

<!-- /wp:paragraph -->

<!-- wp:paragraph -->

**Sample\
MicroPython/Python Code**

<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"language":"python"} -->

``` {.wp-block-syntaxhighlighter-code}
L = [1,2,3,4]
for i in L:
    if(i%2==0):
        del(L[i])
```

<!-- /wp:syntaxhighlighter/code -->

<!-- wp:paragraph -->

For more\
information on differences between Python (in particular CPython) and\
MicroPython you can find the MicroPython documentation here: <http://docs.micropython.org/en/latest/genrst/index.html>

<!-- /wp:paragraph -->
