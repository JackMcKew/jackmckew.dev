Title: Intro to Web Scraping
Date: 2019-08-23 06:30
Category: Python
Author: Jack McKew
Tags: python
Slug: intro-to-web-scraping
Status: published

Following on from last weeks post where we analysed the amount of [repeated letters within current New Zealand town names](https://jmckew.com/2019/08/16/looking-for-patterns-in-city-names-interactive-plotting/). There was still one part of that analysis that really bugged me, and if you noticed it was from the data set that was used was using the European town names not the original Maori names. This post will be dedicated to introducing web scraping where we will extract the Maori names and run a similar analysis to present an interactive graph.

As like previously, let's take a look at the interactive graph before getting into how it was created.

<iframe src="..\html\intro-to-web-scraping\letter_count.html"
    sandbox="allow-same-origin allow-scripts"
    width="100%"
    height="500"
    scrolling="no"
    seamless="seamless"
    frameborder="0">
</iframe>

Similarly with most of my posts of this nature, we always begin by getting the data. To find a data set that gives us as many Maori town or place names as possible proved to be quite challenging, but luckily for Maori Language week NZhistory.gov.nz posted a table of a 1000 Maori place names, their components and the meaning. This data can be found: <https://nzhistory.govt.nz/culture/maori-language-week/1000-maori-place-names>.

Unlike last time however with our world city names from [Kaggle](https://www.kaggle.com/), this data isn't nicely supplied to us in an Excel format. While it may be possible to directly copy-paste from the website into a spreadsheet, I think this is a great way to ease into web scraping.

What is Web Scraping?
---------------------

Web scraping, web harvesting or web data extraction is the process of extracting data from websites. To do this in Python, while there is multiple ways to achieve this (requests + beautiful soup, selenium, etc), my personal favourite package to use is [Scrapy](https://scrapy.org/). While it may be daunting to begin with from a non object-oriented basis, you will soon appreciate it more once you've begun using it.

Initially the premise around the [Scrapy](https://scrapy.org/) package is to create 'web spiders'. If we take a look of the structure of the first example on the [Scrapy](https://scrapy.org/) website we get an understanding on how to structure our web spiders when developing:

``` python
import scrapy

class BlogSpider(scrapy.Spider):
    name = 'blogspider'
    start_urls = ['https://blog.scrapinghub.com']

    def parse(self, response):
        for title in response.css('.post-header>h2'):
            yield {'title': title.css('a ::text').get()}
        for next_page in response.css('a.next-posts-link'):
            yield response.follow(next_page, self.parse)
```

First of all we can see that the custom spider is essentially an extension of the scrapy.Spider class. It is to be noted that the name and start\_urls variables (which are apart of the class) are special in the sense the scrapy package uses them as configuration settings. When it comes to web scraping, if you have had experience using HTML, CSS and/or Javascript, this experience will become extremely useful; that is not to say it is not possible without experience, it's just a learning curve.

Following on we can see a function for parsing (also specially named) in which there are 2 loops, the first for loop is going to loop through all title's marked as headers (specifically h2) and return a dictionary with the text in the heading.

``` python
class NameSpider(scrapy.Spider):
    name = 'names'
    start_urls = ['https://nzhistory.govt.nz/culture/maori-language-week/1000-maori-place-names/']

    def parse(self,response):
        def extract_from_table(table_row,table_col):
            return response.xpath(f"//tr[{table_row}]//td[{table_col}]//text()").get()
        
        for i in range(2,1000):
            yield {
                'Place Name' : extract_from_table(i,1),
                'Components' : extract_from_table(i,2),
                'Meaning' : extract_from_table(i,3)
            }
```

Now that we have created our spider that looks through each row of the table on the webpage (more information on determining this can be found: <https://docs.scrapy.org/en/latest/intro/tutorial.html>). It's time to run the spider and take a look at the output. To run a spider you go into the directory from the command line and run 'scrapy crawl \<spider name\>' and to store an output at the same time 'scrapy crawl \<spider name\> -o filename.csv -t csv.

Now similar to the previous post, we run a similar analysis and plot with Bokeh!

``` python
import pandas as pd
import collections
from collections import OrderedDict
import operator
import matplotlib.pyplot as plt
import numpy as np
import math
from bokeh.io import show, output_file
from bokeh.plotting import figure
from bokeh.models import ColumnDataSource
from bokeh.models.tools import HoverTool

names_df = pd.read_csv('names.csv', header=0, sep=',', quotechar='"')
nz_names = names_df['Place Name'].tolist()
nz_dict = { i : 0 for i in nz_names }
letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
lcount = dict(OrderedDict([(l, 0) for l in letters]))

for name in nz_names:
    nz_dict[name] = dict(OrderedDict([(l, 0) for l in letters]))
    city_dict = nz_dict[name]
    for c in name:
        if c.upper() in letters:
            city_dict[c.upper()] += 1

total_df = pd.DataFrame.from_dict(nz_dict)
total_df = total_df.T

max_letters_cities = total_df.idxmax().tolist()
lettercounts = total_df.loc[total_df.idxmax()].max().tolist()
maxletters = dict(OrderedDict([(l, 0) for l in letters]))
for i,l in enumerate(letters):
    maxletters[l] = max_letters_cities[i]
    maxletters[l] = (lettercounts[i])

summary_df = pd.DataFrame()
scale = 1
summary_df['Word_Name'] = total_df.idxmax()
summary_df['Count'] = total_df.loc[total_df.idxmax()].max()

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
```
