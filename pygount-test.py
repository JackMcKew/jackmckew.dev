import count_loc

language_stat = count_loc.get_total_loc('content',['.py','.md','.ipynb'])

print(sum(language_stat.values()))

# from pygount import ProjectSummary, SourceAnalysis
# import pathlib
# from typing import List, Dict
# from json import load

# located_files: List[pathlib.Path] = []
# located_jupyter: List[pathlib.Path] = []

# top_path: pathlib.Path = pathlib.Path('content')

# project_summary = ProjectSummary()

# accepted_file_types = ['.py','.md']

# for file_type in accepted_file_types:
#     for found_file_path in top_path.glob(f'**/*{file_type}'):
#         located_files.append(found_file_path)

# for found_file_path in top_path.glob(f'**/*.ipynb'):
#     located_jupyter.append(found_file_path)

# for source_path in located_files:
#     source_analysis = SourceAnalysis.from_file(source_path, "pygount",encoding='utf-8')
#     project_summary.add(source_analysis)

# language_stat_dict: Dict = {}

# for language_summary in project_summary.language_to_language_summary_map.values():
#     language_stat_dict[language_summary.language] = language_summary.code_count - language_summary.empty_count



# def loc(nb):
#     try:
#         cells = load(open(nb))['cells']
#         return sum(len(c['source']) for c in cells if c['cell_type'] == 'code')
#     except:
#         return 0

# def count_lines_jupyter(ipynb_files):
#     return sum(loc(nb) for nb in ipynb_files)

# language_stat_dict['Python'] += count_lines_jupyter(located_jupyter)

# del language_stat_dict['__empty__']

# print(language_stat_dict)
# print(sum(language_stat_dict.values()))