import os
import re


def get_immediate_subdirectories(a_dir):
    return [name for name in os.listdir(a_dir)
            if os.path.isdir(os.path.join(a_dir, name))]

def lowercase_list(list_of_strings):
    return [x.lower() for x in list_of_strings]

def main():
    path = input("Provide path to folders: ")
    list_of_immediate_folders = get_immediate_subdirectories(path)
    new_folder_names = lowercase_list(list_of_immediate_folders)
    new_folder_names = [x.replace(' ','-') for x in new_folder_names]
    full_path_original = [path + '\\' + x for x in list_of_immediate_folders]
    full_path_new = [path + '\\' + x for x in new_folder_names]
    full_path_new = [re.sub(r'(-)\1+', r'\1', x) for x in full_path_new]
    for old, new in zip(full_path_original,full_path_new):
        if os.path.exists(old):
            if 'folder-renaming' not in old:
                os.rename(old,new)

if __name__ == "__main__":
    main()