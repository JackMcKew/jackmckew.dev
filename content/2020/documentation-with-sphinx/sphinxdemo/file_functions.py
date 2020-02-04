import os
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