import pathlib
from typing import List


def locate_files(path: str,file_type:str) -> List[pathlib.Path]:
    top_path: pathlib.Path = pathlib.Path(path)

    if "." not in file_type:
        print("File types must include a period eg, '.md'")

    located_files: List[pathlib.Path] = []

    for found_file_path in top_path.glob(f'**/*{file_type}'):
        if file_type != '.ipynb':
            located_files.append(found_file_path)
        else:
            if 'checkpoint' not in found_file_path.name:
                located_files.append(found_file_path)

    return located_files
