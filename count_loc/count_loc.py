from json import load
from typing import Dict, List

from pygount import ProjectSummary, SourceAnalysis

from count_loc._util.file_locate import locate_files


def loc(nb):
    try:
        cells = load(open(nb))["cells"]
        return sum(len(c["source"]) for c in cells if c["cell_type"] == "code")
    except:
        return 0


def count_lines_jupyter(ipynb_files):
    return sum(loc(nb) for nb in ipynb_files)


def get_total_loc(path: str, file_types: List, custom_paths: List):
    total_file_list: List = []
    total_file_list.extend(custom_paths)
    jupyter_list: List = []
    total_loc: int = 0
    project_summary = ProjectSummary()
    for file_type in file_types:
        if file_type != ".ipynb":
            total_file_list.extend(locate_files(path, file_type))
        else:
            jupyter_list.extend(locate_files(path, file_type))

    for source_path in total_file_list:
        source_analysis = SourceAnalysis.from_file(
            source_path, "pygount", encoding="utf-8"
        )
        project_summary.add(source_analysis)

    language_stat_dict: Dict = {}

    for language_summary in project_summary.language_to_language_summary_map.values():
        language_stat_dict[language_summary.language] = (
            language_summary.code_count - language_summary.empty_count
        )

    language_stat_dict["Python"] += count_lines_jupyter(jupyter_list)

    del language_stat_dict["__empty__"]

    return language_stat_dict
