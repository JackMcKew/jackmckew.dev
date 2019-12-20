Title: Distributing Python Code
Date: 2019-05-31 06:30
Category: Python
Author: admin
Tags: pyinstaller, python
Slug: distributing-python-code
Status: published

This post will cover a way of distributing Python code such that is can be used by someone that does not have Python installed. One of the major drawbacks with Python that the gap is slowly being closed is how easy it is to distribute Python code.

At a minimum, the computer that is to run the code must have the Python compiler (or equivalent). Now while this has been progressively included in more operating systems as a default (May update of Windows being the latest), you must still develop as such that is not present on the users' PC.

For this post, I will show you a basic piece of code to demonstrate how it will be packaged and distributed to your users. To show a basic dialog box on the screen with the following code:

``` python
import ctypes

ctypes.windll.user32.MessageBoxW(0, "Hello Windows!", "PyInstaller Example", 1)
```

Which shows the user with this dialog box:

![python_Dh0hFJKqDx]({static img/python_Dh0hFJKqDx.png})

Now to package this code into an executable (.exe), there are multiple packages out there that are possible to use, some examples of these are:

-   [cx\_freeze](https://anthony-tuininga.github.io/cx_Freeze/)
-   [py2exe](http://www.py2exe.org/)
-   [PyInstaller](https://www.pyinstaller.org/)

For this post, I will use PyInstaller as it is what I am most familiar with, please get in touch with me if you believe any other package is better suited. I have created an environment in anaconda named "pyinstall", in which I have installed PyInstaller with the command "conda install -c conda-forge pyinstaller", which includes Python 3.7.3 due to anaconda's packaging system (thereby including ctypes from the standard library).

Now to use the PyInstaller package, just open Anaconda Prompt (or cmd if anaconda.exe is in your PATH). Navigate to where the python code is stored, and run the command "pyinstaller \<name\_of\_program\>.py. See below for an example:

![cmd_PXbANiLF4N.png]({static img/cmd_PXbANiLF4N.png})

This will create a build & dist folder within the directory you navigated to, which contains the python application and all the required files will be put inside the dist folder which will be shipped to the user later on. There are many other settings that you can use to customize how your package gets built and more, but I won't go into that in this post.

![explorer_409CFHxhyh.png]({static img/explorer_409CFHxhyh.png})

Now if we go into the dist folder and find the .exe (which will have the same name as your python file unless you change this setting). Once you hit run, you'll be met by this screen:

![pyinstall_example_w5KP1B327W.png]({static img/pyinstall_example_w5KP1B327W.png})

Now you can send this executable to anyone (although most antivirus will stop you) and it will run on their PC!

