Title: Looking for Patterns in City Names & Interactive Plotting
Date: 2019-08-16 06:30
Author: Jack McKew
Tags: python
Slug: looking-for-patterns-in-city-names-interactive-plotting
Status: published

Recently, I was traveling around New Zealand, and noticed in the Maori language they use letters back to back a lot like in the original Maori name for Stratford ("whakaahurangi"). So as any normal person does, I thought, well what town has the most repeated letters, and the idea for this blog post was born. Before we get into the nitty gritty, here is the output of the analysis!

<iframe src="..\html\looking-for-patterns-in-city-names-interactive-plotting\NZ_City_Letter_Analysis.html"
    sandbox="allow-same-origin allow-scripts"
    width="100%"
    height="500"
    scrolling="no"
    seamless="seamless"
    frameborder="0">
</iframe>

Firstly, we have to find a dataset of all the town names, and I found a database of all world cities names hosted on Kaggle here: <https://www.kaggle.com/max-mind/world-cities-database>.

Get the data! {#Get-the-data!}
-------------

``` python
# data source https://www.kaggle.com/max-mind/world-cities-database
cities_df = pd.read_csv('./data/worldcitiespop.csv', header=0, sep=',', quotechar='"')
cities_df = cities_df[cities_df['Country'] == "nz"]
```

After inspecting the data of this data set, we're able to filter out to look at just New Zealand with the prefix of "nz" in the Country column. It must be noted that this data set represents the names of the towns currently, and not the original Maori names (more on this will be covered in a later post). Now we want to extract the town names out of the dataframe with the ones we want to analyze. For ease later on, we will extract this as a dictionary, such that we can assign the value of each to the count of each letter.

``` python
nz_cities = cities_df[cities_df['Country'] == "nz"]['AccentCity'].tolist()
nz_dict = { i : 0 for i in nz_cities }
```

Now we will create an ordered dictionary with the help from the collections package which will store the values of the count for each letter in the town name.

``` python
letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
lcount = dict(OrderedDict([(l, 0) for l in letters]))
```

Now it's time for the data crunch. To count how many times a letter repeats in a town name we follow these steps:

-   we create a for loop, to loop through all the city names in the table,
-   initialise an ordered dictionary similar to above for each city in the value field of that town's dictionary entry
-   loop through each letter in the town name
-   check if the letter appears in our letter dictionary (mainly to not count spaces),
-   Then if the letter does appear, increment the value for that letter by 1.

This results in a dictionary for each town name, with the count of repeated letters.

``` python
for city in nz_cities:
    nz_dict[city] = dict(OrderedDict([(l, 0) for l in letters]))
    city_dict = nz_dict[city]
    for c in city:
        if c.upper() in letters:
            city_dict[c.upper()] += 1
```

Hooray! Now we have all the data we need broken down and ready for analysis. To help ease the analysis and make it more readable for a human, we convert from our nested dictionaries to a pandas dataframe and transpose it such that we have the town name as the index, the letters as the column and the count of that letter as the values.

``` python
total_df = pd.DataFrame.from_dict(nz_dict)
total_df = total_df.T
```

Now we want to find which of these names have the maximum count for any particular letter and store it in a summary dataframe. It is to be noted that we could use the pivot function with aggregate types, however, I have not figured a nice way to do this yet. If you do know a nicer way to determine this, please let me know.

``` python
summary_df = pd.DataFrame()
scale = 1
summary_df['City_Name'] = total_df.idxmax()
summary_df['Count'] = total_df.loc[total_df.idxmax()].max()
```

Now by using the equivalent of an index-match in excel which you can read more about here (<https://towardsdatascience.com/name-your-favorite-excel-function-and-ill-teach-you-its-pandas-equivalent-7ee4400ada9f>). Admittedly, we could've made the join earlier, but since I use index-match so often in Excel, I wanted to learn how to do the same in pandas. This is achieved by using the map function (which is the equivalent of the index), but by using the index of another dataframe as the argument (the match function), we can rejoin the data set by matching the city name from our original data set.

``` python
summary_df['Latitude'] = summary_df['City_Name'].map(cities_df.set_index(['AccentCity'])['Latitude'].to_dict()) * scale
summary_df['Longitude'] = summary_df['City_Name'].map(cities_df.set_index(['AccentCity'])['Longitude'].to_dict()) * scale
```

Now we have a dataframe that contains:

-   an index of the letters,
-   the town name with the most repeated letters,
-   the count of the letters within the name,
-   the longitude and latitude of the town

For plotting with [Bokeh](https://bokeh.pydata.org/en/latest/) on a basemap, we need to convert from longitude & latitude to easting and northing. To do this we use the pyproj package to make this very simple.

``` python
def LongLat_to_EN(long, lat):
    try:
      easting, northing = transform(
        Proj(init='epsg:4326'), Proj(init='epsg:3857'), long, lat)
      return easting, northing
    except:
      return None, None
```

This function can be used to generate the easting and northing for every town from it's longitude & latitude and add it to the dataframe.

``` python
summary_df['E'], summary_df['N'] = zip(*summary_df.apply(lambda x: LongLat_to_EN(x['Longitude'], x['Latitude']), axis=1))
```

Finally, it's time to plot our findings on a map. Before we initialise the map in [Bokeh](https://bokeh.pydata.org/en/latest/), for most plots, data tables and more in [Bokeh](https://bokeh.pydata.org/en/latest/), we need to put it in the [ColumnDataSource](https://bokeh.pydata.org/en/latest/docs/reference/models/sources.html) form. We also initialise the interactivity when the user hovers over the data points on the plot.

``` python
source = ColumnDataSource(data=dict(
                        longitude=list(summary_df['E']), 
                        latitude=list(summary_df['N']),
                        sizes=list(summary_df['Count']*3),
                        lettercount = list(summary_df['Count']),
                        city_name=list(summary_df['City_Name']),
                        letters = list(summary_df.index)))

hover = HoverTool(tooltips=[
    ("Repeated Letter" , "@letters"),
    ("City Name", "@city_name"),
    ("Count","@lettercount")
    
])
```

Finally time for the plot! Now admittedly, I haven't found an easy way to find the limits of the graph, so this was made with a lot of trial and error (If you know a better way, please let me know!).

``` python
p = figure(x_range=(20000000,17900000), y_range=(-6000000,-4000000),x_axis_type="mercator", y_axis_type="mercator",tools=[hover, 'wheel_zoom','save'])
p.add_tile(CARTODBPOSITRON)
p.circle(x='longitude',
         y='latitude', 
         size='sizes',
         source=source,
         line_color="#FF0000", 
         fill_color="#FF0000",
         fill_alpha=0.05)
```
