Title: Making Executable GUIs with Python, Gooey & Pyinstaller
Date: 2019-11-01 06:30
Category: Python
Author: Jack McKew
Tags: python
Slug: making-executable-guis-with-python-gooey-pyinstaller
Status: published

Today we will go through how to go from a python script to packaged executable with a guided user interface (GUI) for users. First off we still start by writing the scripts that we would like to share with others to be able to use, especially for users that may be uncomfortable in a programming environment and would feel at home with a GUI.

My personal favourite part about [Gooey](https://github.com/chriskiehl/Gooey), is that you are essentially creating a command line interface (CLI) tool, which Gooey then uses to generate a GUI. This eliminates having two separate code bases to facilitate CLI & GUI users, which can be very painful at times.

```python
def print_file_name(path,filesize):
    """
    Inputs:
        path (str): filepath to file selected
        filezize (bool): whether to print the file size or not
    Prints file name of file from path given and if filesize is true then will print the total size of the file in bytes
    """
    print(os.path.basename(path))
    if filesize:
        print(f"File size: {os.path.getsize(path)} bytes")

def get_files_in_folder(path,extension):
    """
    Inputs:
        path (str): path to folder selected
        extension (str): extension to filter by
    Prints all files in folder, if an extension is given, will only print the files with the given extension
    """
    f = []
    for (dirpath, dirnames, filenames) in os.walk(path):
        if extension:
            for filename in filenames:
                if filename.endswith(extension):
                    f.append(filename)
        else:
            f.extend(filenames)
    return f
```

The 2 functions defined above are for getting information of selected files, or returning a list of files found within a folder (and subfolders).

Now to use [Gooey](https://github.com/chriskiehl/Gooey), we need to define a 'main' function for parsing the arguments for the GUI to generate controls. As Gooey is based on the argparse library, if you have previously built CLI tools with argparse, the migration to Gooey is quite simplistic. However as there is always edge cases, ensure to check your tools functionality once you have developed it.

```python
@Gooey(optional_cols=2,program_name="Gooey Executable with Pyinstaller")
def parse_args():
    prog_descrip = 'Pyinstaller example with Gooey'
    parser = GooeyParser(description=prog_descrip)

    sub_parsers = parser.add_subparsers(help='commands', dest='command')

    first_parser = sub_parsers.add_parser('file',help='This function prints the chosen file name')

    first_parser.add_argument('file_path',help='Select a random file',type=str,widget='FileChooser')

    first_parser.add_argument('--file-size',help='Do you want to print the file size?',action='store_true')

    second_parser = sub_parsers.add_parser('folder',help='This funtion prints all files in a folder')

    second_parser.add_argument('folder_path',help='Select a folder',type=str,widget='DirChooser')

    second_parser.add_argument('--file-type',help='Specify file type with .jpg',type=str)

    args = parser.parse_args()

    return args

```

By using the Gooey decorator we are able to define many different layout options for our GUI. Since we are trying to enable users to use multiple scripts which are different and separate, I personally like to the optional columns layout, but there are many other types of layouts which can be seen here: [https://github.com/chriskiehl/Gooey#layout-customization](https://github.com/chriskiehl/Gooey#layout-customization).

Following this we create our argument parsing function, and in which we define parsers, subparsers and add the arguments. This post will not be covering how to write CLIs, but it is on the list for future posts.

To complete the script, we need to put in the functionality at startup.

```python
if __name__ == '__main__':
    conf = parse_args()
    if conf.command == 'file':
        print_file_name(conf.file_path,conf.file_size)
    elif conf.command == 'folder':
        print(get_files_in_folder(conf.folder_path,conf.file_type))

```

By embedding the command names within the arguments we are able to use a variety of functions which may or may not be interconnected.

 Once this file is run will generate the following:

![image-20191102174048814]({static img/image-20191102174048814.png})

![image-20191102174059066]({static img/image-20191102174059066.png})

Which are fully embedded within the windows file explorer system for selecting files, folders, etc.

Now to package this GUI as an executable, we use [PyInstaller](https://www.pyinstaller.org/). By following Chris Kiehl's (Developer of Gooey) instructions on using Pyinstaller and Gooey: [https://chriskiehl.com/article/packaging-gooey-with-pyinstaller](https://chriskiehl.com/article/packaging-gooey-with-pyinstaller). All we need to is create a build.spec file within our directory and run pyinstaller build.spec.

![image-20191102174521992]({static img/image-20191102174521992.png})

This will then generate a build folder and a dist folder within your current directory. The build folder will contain all the files used in generating the executable, which is found within the dist folder.

![image-20191102174758361]({static img/image-20191102174758361.png})

The code in it's entirety is:

```python
from gooey import Gooey, GooeyParser
import os

@Gooey(optional_cols=2,program_name="Gooey Executable with Pyinstaller")
def parse_args():
    prog_descrip = 'Pyinstaller example with Gooey'
    parser = GooeyParser(description=prog_descrip)

    sub_parsers = parser.add_subparsers(help='commands', dest='command')

    first_parser = sub_parsers.add_parser('file',help='This function prints the chosen file name')

    first_parser.add_argument('file_path',help='Select a random file',type=str,widget='FileChooser')

    first_parser.add_argument('--file-size',help='Do you want to print the file size?',action='store_true')

    second_parser = sub_parsers.add_parser('folder',help='This funtion prints all files in a folder')

    second_parser.add_argument('folder_path',help='Select a folder',type=str,widget='DirChooser')

    second_parser.add_argument('--file-type',help='Specify file type with .jpg',type=str)

    args = parser.parse_args()

    return args

def print_file_name(path,filesize):
    """
    Inputs:
        path (str): filepath to file selected
        filezize (bool): whether to print the file size or not
    Prints file name of file from path given and if filesize is true then will print the total size of the file in bytes
    """
    print(os.path.basename(path))
    if filesize:
        print(f"File size: {os.path.getsize(path)} bytes")

def get_files_in_folder(path,extension):
    """
    Inputs:
        path (str): path to folder selected
        extension (str): extension to filter by
    Prints all files in folder, if an extension is given, will only print the files with the given extension
    """
    f = []
    for (dirpath, dirnames, filenames) in os.walk(path):
        if extension:
            for filename in filenames:
                if filename.endswith(extension):
                    f.append(filename)
        else:
            f.extend(filenames)
    return f


if __name__ == '__main__':
    conf = parse_args()
    if conf.command == 'file':
        print_file_name(conf.file_path,conf.file_size)
    elif conf.command == 'folder':
        print(get_files_in_folder(conf.folder_path,conf.file_type))
```

> If you run into an error on Windows with the alert "Failed to execute script pyi_rth_pkgres", install the dev version of pyinstaller
> pip install <https://github.com/pyinstaller/pyinstaller/archive/develop.zip>
> This was noted in this issue on github: [https://github.com/pyinstaller/pyinstaller/issues/2137](https://github.com/pyinstaller/pyinstaller/issues/2137)
