#%%
import pandas as pd
import collections
from collections import OrderedDict
import operator
import matplotlib.pyplot as plt
import numpy as np
import math
#%%

names_df = pd.read_csv('names.csv', header=0, sep=',', quotechar='"')
display(names_df)

#%%
nz_names = names_df['Place Name'].tolist()
nz_dict = { i : 0 for i in nz_names }

#%%
letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

lcount = dict(OrderedDict([(l, 0) for l in letters]))
display(lcount)

#%%

for name in nz_names:
    nz_dict[name] = dict(OrderedDict([(l, 0) for l in letters]))
    city_dict = nz_dict[name]
    for c in name:
        if c.upper() in letters:
            city_dict[c.upper()] += 1

display(nz_dict) 
#%%
total_df = pd.DataFrame.from_dict(nz_dict)
total_df = total_df.T
display(total_df)

#%%
total_df.idxmax()

max_letters_cities = total_df.idxmax().tolist()
lettercounts = total_df.loc[total_df.idxmax()].max().tolist()
maxletters = dict(OrderedDict([(l, 0) for l in letters]))
for i,l in enumerate(letters):
    maxletters[l] = max_letters_cities[i]
    maxletters[l] = (lettercounts[i])

display(maxletters)

#%%
summary_df = pd.DataFrame()
scale = 1
summary_df['Word_Name'] = total_df.idxmax()
summary_df['Count'] = total_df.loc[total_df.idxmax()].max()
# summary_df['Latitude'] = summary_df['City_Name'].map(cities_df.set_index(['AccentCity'])['Latitude'].to_dict()) * scale
# summary_df['Longitude'] = summary_df['City_Name'].map(cities_df.set_index(['AccentCity'])['Longitude'].to_dict()) * scale

#%%

display(summary_df)


#%%
#%%
from bokeh.io import show, output_file
from bokeh.plotting import figure
from bokeh.models import ColumnDataSource
from bokeh.models.tools import HoverTool

source = ColumnDataSource(summary_df)
output_file("letter_count.html")

hover = HoverTool()
hover.tooltips=[
    ('Word', '@Word')
]

p = figure(x_range=summary_df.index.tolist(), plot_height=250, title="Letter Counts",
           toolbar_location=None)

p.vbar(x='index', top='Count', width=0.9,source=source)
p.add_tools(hover)
p.xgrid.grid_line_color = None
p.y_range.start = 0

show(p)

#%%
