import os
import re
import sys
import pathlib
from typing import List
import nbformat
import io
from nbformat import current
import pandas as pd
import textstat

def count_words_in_markdown(filePath: str):
    with open(filePath, 'r', encoding='utf8') as f:
        text = f.read()

    # Comments
    text = re.sub(r'<!--(.*?)-->', '', text, flags=re.MULTILINE)
    # Tabs to spaces
    text = text.replace('\t', '    ')
    # More than 1 space to 4 spaces
    text = re.sub(r'[ ]{2,}', '    ', text)
    # Footnotes
    text = re.sub(r'^\[[^]]*\][^(].*', '', text, flags=re.MULTILINE)
    # Indented blocks of code
    text = re.sub(r'^( {4,}[^-*]).*', '', text, flags=re.MULTILINE)
    # Replace newlines with spaces for uniform handling
    text = text.replace('\n', ' ')
    # Custom header IDs
    text = re.sub(r'{#.*}', '', text)
    # Remove images
    text = re.sub(r'!\[[^\]]*\]\([^)]*\)', '', text)
    # Remove HTML tags
    text = re.sub(r'</?[^>]*>', '', text)
    # Remove special characters
    text = re.sub(r'[#*`~\-–^=<>+|/:]', '', text)
    # Remove footnote references
    text = re.sub(r'\[[0-9]*\]', '', text)
    # Remove enumerations
    text = re.sub(r'[0-9#]*\.', '', text)

    return len(text.split())

def count_words_in_jupyter(filePath: str, returnType:str = 'markdown'):
    with io.open(filePath, 'r', encoding='utf-8') as f:
        nb = current.read(f, 'json')

    word_count_markdown: int = 0
    word_count_heading: int = 0
    word_count_code: int = 0
    for cell in nb.worksheets[0].cells:
        if cell.cell_type == "markdown":
            word_count_markdown += len(cell['source'].replace('#', '').lstrip().split(' '))
        elif cell.cell_type == "heading":
            word_count_heading += len(cell['source'].replace('#', '').lstrip().split(' '))
        elif cell.cell_type == "code":
            word_count_code += len(cell['input'].replace('#', '').lstrip().split(' '))

    if returnType == 'markdown':
        return word_count_markdown
    elif returnType == 'heading':
        return word_count_heading
    elif returnType == 'code':
        return word_count_code
    else:
        return Exception



topFolder: pathlib.Path = pathlib.Path('C:\\Users\\jackm\\Documents\\GitHub\\jackmckew.dev\\content\\')

allMarkdown: List  = []
allJupyter: List  = []

for singleFile in topFolder.glob('**/*'):
    if singleFile.suffix == '.md':
        # Append path        
        allMarkdown.append(singleFile)
    if singleFile.suffix == '.ipynb' and 'checkpoint' not in singleFile.name:
        allJupyter.append(singleFile)

totalList: List = allJupyter + allMarkdown

textStatistics: pd.DataFrame = pd.DataFrame(totalList,columns=['Path'])

textStatistics['File Name'] = textStatistics.apply(lambda x: x['Path'].name,axis=1)

textStatistics['Extension'] = textStatistics.apply(lambda x: x['Path'].suffix,axis=1)

def read_markdown(filePath: str):
    with open(filePath, 'r', encoding='utf8') as f:
        text = f.read()

    # Comments
    text = re.sub(r'<!--(.*?)-->', '', text, flags=re.MULTILINE)
    # Tabs to spaces
    text = text.replace('\t', '    ')
    # More than 1 space to 4 spaces
    text = re.sub(r'[ ]{2,}', '    ', text)
    # Footnotes
    text = re.sub(r'^\[[^]]*\][^(].*', '', text, flags=re.MULTILINE)
    # Indented blocks of code
    text = re.sub(r'^( {4,}[^-*]).*', '', text, flags=re.MULTILINE)
    # Replace newlines with spaces for uniform handling
    text = text.replace('\n', ' ')
    # Custom header IDs
    text = re.sub(r'{#.*}', '', text)
    # Remove images
    text = re.sub(r'!\[[^\]]*\]\([^)]*\)', '', text)
    # Remove HTML tags
    text = re.sub(r'</?[^>]*>', '', text)
    # Remove special characters
    text = re.sub(r'[#*`~\-–^=<>+|/:]', '', text)
    # Remove footnote references
    text = re.sub(r'\[[0-9]*\]', '', text)
    # Remove enumerations
    text = re.sub(r'[0-9#]*\.', '', text)

    return text

def read_jupyter(filePath: str,returnType:str):
    with io.open(filePath, 'r', encoding='utf-8') as f:
        nb = current.read(f, 'json')

    markdown_text: str = ""
    heading_text: str = ""
    code_text: str = ""
    for cell in nb.worksheets[0].cells:
        if cell.cell_type == "markdown":
            markdown_text += cell['source'].replace('#','').lstrip()
        elif cell.cell_type == "heading":
            heading_text += cell['source'].replace('#','').lstrip()
        elif cell.cell_type == "code":
            code_text += cell['input'].replace('#','').lstrip()

    if returnType == 'markdown':
        return markdown_text
    elif returnType == 'heading':
        return heading_text
    elif returnType == 'code':
        return code_text
    else:
        return Exception

def read_file_text(filePath:pathlib.WindowsPath):
    if filePath.suffix == '.md':
        return read_markdown(filePath)
    elif filePath.suffix == '.ipynb':
        return read_jupyter(filePath,'markdown')
    else:
        return Exception

# for singleNotebook in allJupyter:
#     print(singleNotebook)
#     print(count_words_in_jupyter(singleNotebook))

# totalNumberOfWords: int = 0
# for singlePost in allMarkdown:
#     # with open(singlePost, 'r', encoding='utf8') as f:
#         totalNumberOfWords += count_words_in_markdown(singlePost)
# for singleNotebook in allJupyter:
#     totalNumberOfWords += count_words_in_jupyter(singleNotebook)

# print(totalNumberOfWords)

textStatistics['Content'] = textStatistics['Path'].apply(read_file_text)

textStatistics['Word Count'] = textStatistics['Content'].apply(lambda x: len(x.split(' ')))

from inspect import getmembers, ismethod

textstat_methodList: List = [o for o in getmembers(textstat) if ismethod(o[1])]

for method in textstat_methodList:
    try:
        textStatistics[method[0]] = textStatistics['Content'].apply(method[1])
    except Exception as e:
        print(f"{method[0]} Failed due to {e}")

print(textstat_methodList)
print(textStatistics)
print(textStatistics['Word Count'].sum())
textStatistics.to_csv('blog_text_statistics.csv')
# for index, row in textStatistics.iterrows():
#     if row['Extension'] == '.ipynb':
#         read_jupyter(row['Path'],'markdown')