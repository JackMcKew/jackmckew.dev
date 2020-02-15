""" Functions for parsing folders for files.
"""

import os


def get_files_in_folder(path, extension):
    """
    Prints all files in folder, if an extension is given, will only print the files with the given extension

    Args:
        path (string): folder to recursively search through for specific extensions
        extension (string): extension of file type to filter by

    Returns:
        list: list of all filenames within path with matching extension
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
