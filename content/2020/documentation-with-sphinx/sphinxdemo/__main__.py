from .file_functions import get_files_in_folder

if __name__ == "__main__":
    py_files = get_files_in_folder(".", extension=".py")

    print(py_files)
