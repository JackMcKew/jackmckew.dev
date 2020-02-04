""" Main runtime for sphinxdemo-with-docs package

__main__.py file used within package to work with `python -m` functionality.

Prints out list of all *.py files within current directory when run
"""
from .file_functions import get_files_in_folder

if __name__ == "__main__":
    py_files = get_files_in_folder(".",extension=".py")

    print(py_files)
    