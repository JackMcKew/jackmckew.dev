Title: Python and Data Security (Hashing Algorithms)
Date: 2019-06-21 06:30
Author: Jack McKew
Tags: python, security
Slug: python-and-data-security-hashing-algorithms
Status: published

Data security is becoming more and more prevalent in today's society than ever before. We must make a conscious effort to secure both our physical lives, but also our digital lives as well. With data privacy, sharing of information and access control becoming integrated into most people's life in some way or another. Since this topic is so wide and deep, this will most likely become a series of posts as I am passionate around data security and enjoy getting stuck right into the math behind it. This post will be around hashing algorithms but future topics will include:

-   Hashing Algorithms (this post),
-   Modular Arithmetic and why it's used,
-   Securely sharing keys,
-   Methods of encryption,
-   Methods of data security,
-   Analysing security weaknesses,
-   Many more.

As above, this post is dedicated to hashing algorithms and how to interface with them with Python for data security.

### What is a Hashing Algorithm?

The sole purpose of a hashing algorithm is to generate a safe hash which in turn raises the questions of what is a hash and what makes it safe?

> A hash is a value computed from a base input number using a hashing function.

With a hashing function being:

> A **hash function** is any [function](https://en.wikipedia.org/wiki/Function_(mathematics)) that can be used to map [data](https://en.wikipedia.org/wiki/Data_(computing)) of arbitrary size onto data of a fixed size.
>
> <cite>https://en.wikipedia.org/wiki/Hash\_function</cite>

The hashing algorithm is intrinsically designed to be a one-way function, meaning it is impractical to revert. Although, as history has shown, as computing advances are made hashing algorithms are becoming compromised. A prime example of this being the MD5 algorithm, which was designed and used a cryptographic hash function (data security), but is now so simply reverse, that it is used for verifying data transfers.

There are certain characteristics around what the perfect or ideal hash function for data security should possess:

-   Easy/speed of computation,
-   Impossible/impractical to regenerate source data/message (brute force as only option),
-   Unique hashes for data (also known as hash collisions when there are duplicate hashes),
-   Any change is source data should change the hash value (known as the avalanche effect).

### What is hashing used for in practice?

Hashing algorithms for data security in the real world is used in a variety of situations from ensuring files were successfully delivered correctly or to store sensitive/private information. If you are reading this, I can almost guarantee that you have some interface with a hashing algorithm right now! Whether it be how you're password is stored to indexing data in a database.

### Using hashes with Python

This will be a simple use-case of a hashing algorithm using Python to securely convert passwords and how to verify against them (storing the hashed data is it's own beast in itself). Please note I will be utilising the [passlib](https://passlib.readthedocs.io/en/stable/) package which contains over 30 password hashing algorithms, as well as a framework for managing existing password hashes.

First of all we must select a hashing algorithm to use, to help with this from the team at passlib they have provided a [basic guideline of questions](https://passlib.readthedocs.io/en/stable/narr/quickstart.html):

1.  Does the hash need to be natively supported by your operating system’s `crypt()` api,\
    in order to allow inter-operation with third-party applications on the host?
    </p>
-   If yes, the right choice is either [`bcrypt`](https://passlib.readthedocs.io/en/stable/lib/passlib.hash.bcrypt.html#passlib.hash.bcrypt) for BSD variants,\
        or [`sha512_crypt`](https://passlib.readthedocs.io/en/stable/lib/passlib.hash.sha512_crypt.html#passlib.hash.sha512_crypt) for Linux; since these are natively supported.
    -   If no, continue...
    
2.  Does your hosting provider allow you to install C extensions?
    -   If no, you probably want to use [`pbkdf2_sha256`](https://passlib.readthedocs.io/en/stable/lib/passlib.hash.pbkdf2_digest.html#passlib.hash.pbkdf2_sha256),\
        as this currently has the fastest pure-python backend.
    -   If they allow C extensions, continue...
3.  Do you want to use the latest & greatest, and don’t mind increased memory usage\
    when hashing?
    </p>

    -   [`argon2`](https://passlib.readthedocs.io/en/stable/lib/passlib.hash.argon2.html#passlib.hash.argon2) is a next-generation hashing algorithm,\
        attempting to become the new standard. It’s design has been being slightly tweaked\
        since 2013, but will quite likely become *the* standard in the next few years.\
        You’ll need to install the [argon2\_cffi](https://pypi.python.org/pypi/argon2_cffi)\
        support library.
    -   If you want something secure, but more battle tested, continue...

4.  The top choices left are [`bcrypt`](https://passlib.readthedocs.io/en/stable/lib/passlib.hash.bcrypt.html#passlib.hash.bcrypt) and [`pbkdf2_sha256`](https://passlib.readthedocs.io/en/stable/lib/passlib.hash.pbkdf2_digest.html#passlib.hash.pbkdf2_sha256).\
    Both have advantages, and their respective rough edges;\
    though currently the balance is in favor of bcrypt\
    (pbkdf2 can be cracked somewhat more efficiently).
    </p>

    -   If choosing bcrypt, we strongly recommend installing the [bcrypt](https://pypi.python.org/pypi/bcrypt)\
        support library on non-BSD operating systems.
    -   If choosing pbkdf2, especially on python2 \< 2.7.8 and python 3 \< 3.4,\
        you will probably want to install [fastpbk2](https://pypi.python.org/pypi/fastpbkdf2)\
        support library.

From this, we will use the argon2 hashing algorithm. As normal, it is best practice to set up a virtual environment (or conda environment) and install the dependencies, in this case passlib.

First of all, import the hashing algorithm you wish to use from the passlib package:

``` python
from passlib.hash import argon2
```

Following importing the hashing algorithm, to hash the password in our case is very simple and we can have a peak at what the output hash looks like:

``` python
hash = argon2.hash("super_secret_password")

print(hash)
```

> \$argon2i\$v=19\$m=102400,t=2,p=8\$NqY05lyrtdb6v/ee03pvrQ\$mvLTquN71JPjuC+S9QNXYA

The first section ("\$argon2i\$v=19\$m=102400,t=2,p=8\$") is the header information, showing the parameters that the algorithm used to generate the hash. While this seems as if it would make the algorithm easier to break, imagine a scenario where every password is hashed using an hashing algorithm with randomised parameters; verifying passwords would be a nightmare. Let's further break down what this represents:

-   \$argon2i - the variant of Argon2 algorithm being used,
-   \$v=19 - the version of Argon2 being used,
-   \$m=102400,t=2,p=8 - the memory (m), iterations (t) and parallelism (p) parameters being used,
-   \$NqY05lyrtdb6v/ee03pvrQ - the base64-encoded salt (added randomness), using standard base64 encoding and no padding,
-   \$mvLTquN71JPjuC+S9QNXYA - the base64-encoded hashed password (derived key), using standard base64 encoding and no padding.

If we run this again, we can check that the outputs are completely different due to the randomly generated salt.

``` python
hash = argon2.hash("super_secret_password")

print(hash)
```

> \$argon2i\$v=19\$m=102400,t=2,p=8\$8f4/x7hXitGacy6F8N67dw\$/jPKQ98vLQCxkboxRlHa/g

Now that we've generated our new passwords, stored them away in a secure database somewhere, using a secure method of communication somehow, our user wants to login with the password they signed up with ("super\_secret\_password") and we have to check if this is the correct password.

To do this with passlib, it is as simply as calling the .verify function with the plaintext and the equivalent hash which will return a boolean value determining whether of not the password is correct or not.

``` python
print(argon2.verify("super_secret_password",hash))
```

> True

Hooray! Our password verification system works, now we would like to check that if the user inputs a incorrect password that our algorithm returns correctly (false).

``` python
print(argon2.verify("user_name",hash))
```

> False

### Conclusion

Hopefully this has given you some insight into what hashing algorithms are, how they are used and how to use them with Python. They can both be an extremely powerful tool for securing data, however, must always be revisited later on down the track as advancements are made and your system may now be compromised.
