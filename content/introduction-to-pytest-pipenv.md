Title: Introduction to Pytest & Pipenv
Date: 2019-09-20 06:30
Author: admin
Category: Code Fridays
Slug: introduction-to-pytest-pipenv
Status: published

<!-- wp:paragraph -->

Unit tests in general are good practice within software development, they are typically automated tests written to ensure that a function or section of a program (a.k.a the 'unit') meets its design and behaves as intended.

<!-- /wp:paragraph -->

<!-- wp:paragraph -->

This post won't go into testing structures for complex applications, but rather just a simple introduction on how to write, run and check the output of a test in Python with pytest.

<!-- /wp:paragraph -->

<!-- wp:paragraph -->

As this post is on testing, I also thought it might be quite apt for trialing out a difference package for dependency management. In the past I've used anaconda, virtualenv and just pip, but this time I wanted to try out pipenv.

<!-- /wp:paragraph -->

<!-- wp:paragraph -->

Similar to my post [Python Project Workflow](https://jmckew.com/2019/08/30/python-project-workflow/) where I used virtualenv, you must install pipenv in your base Python directory, and typically add the Scripts folder to your path for ease later on. Now all we need to do is navigate to the folder and run:

<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"lineNumbers":false} -->

``` {.wp-block-syntaxhighlighter-code}
pipenv shell
```

<!-- /wp:syntaxhighlighter/code -->

<!-- wp:paragraph -->

This will create a virtual environment somewhere on your computer (unless specified) and create a pipfile in the current folder. The pipfile is a file that essentially describes all the packages used within the project, their version number & so on. This is extremely useful when you pick it back up later on and find where you were at or if you wish to share this with others, they can generate their own virtual environment simply from the pipfile with:

<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"lineNumbers":false} -->

``` {.wp-block-syntaxhighlighter-code}
pipenv install --dev
```

<!-- /wp:syntaxhighlighter/code -->

<!-- wp:paragraph -->

Enough about pipenv, let's get onto trying out pytest.

<!-- /wp:paragraph -->

<!-- wp:paragraph -->

For this post I will place both my function and it's tests in the same file, however, from my understanding it's best practice to separate them, specifically keeping all tests within an aptly named 'tests' directory for your project/package.

<!-- /wp:paragraph -->

<!-- wp:paragraph -->

First off let's define the function we intend to test later:

<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"language":"python","lineNumbers":false} -->

``` {.wp-block-syntaxhighlighter-code}
def subtract(number_1, number_2):
    return number_1 - number_2
```

<!-- /wp:syntaxhighlighter/code -->

<!-- wp:paragraph -->

Now we want to test if our function returns 1 if we give it number\_1 = 2 and number\_2 = 1:

<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"language":"python","lineNumbers":false} -->

``` {.wp-block-syntaxhighlighter-code}
import pytest

def test_subtract():
    assert subtract(2,1) == 1
```

<!-- /wp:syntaxhighlighter/code -->

<!-- wp:paragraph -->

To run this test, open the pipenv shell like above in the directory of the file where you've written your tests and run:

<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"lineNumbers":false} -->

``` {.wp-block-syntaxhighlighter-code}
pytest file_name.py
```

<!-- /wp:syntaxhighlighter/code -->

<!-- wp:paragraph -->

This will output the following:

<!-- /wp:paragraph -->

<!-- wp:image {"id":465,"align":"center"} -->

::: {.wp-block-image}
![](https://jmckew.com/wp-content/uploads/2019/09/image.png){.wp-image-465}
:::

<!-- /wp:image -->

<!-- wp:paragraph -->

Each green dot represents a single test, and we can see that our 1 test passes in 0.02 seconds.

<!-- /wp:paragraph -->

<!-- wp:paragraph -->

To get more information from pytest, use the same command with -v (verbose) option:

<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"lineNumbers":false} -->

``` {.wp-block-syntaxhighlighter-code}
pytest file_name.py -v
```

<!-- /wp:syntaxhighlighter/code -->

<!-- wp:paragraph -->

Now we might want to check that it works for multiple cases, to do this we can use the parametrize functionality of pytest like so:

<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"language":"python","lineNumbers":false} -->

``` {.wp-block-syntaxhighlighter-code}
import pytest

def subtract(number_1, number_2):
    return number_1 - number_2

@pytest.mark.parametrize('number_1, number_2, expected', [
    (2,1,1),
    (5,1,4),
    (6,2,4),
    (-2,1,-3),
])
def test_subtract(number_1,number_2,expected):
    assert expected == subtract(number_1,number_2)
```

<!-- /wp:syntaxhighlighter/code -->

<!-- wp:paragraph -->

Once run with the verbose command, we get the output:

<!-- /wp:paragraph -->

<!-- wp:image {"id":466,"align":"center"} -->

::: {.wp-block-image}
![](https://jmckew.com/wp-content/uploads/2019/09/image-1.png){.wp-image-466}
:::

<!-- /wp:image -->

<!-- wp:paragraph -->

Hopefully this post is a gentle introduction to what unit testing can be in Python.

<!-- /wp:paragraph -->
