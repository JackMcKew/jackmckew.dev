import geopandas as gpd
import pandas_bokeh
pandas_bokeh.output_file('suburb.html')

suburb_dataset = gpd.read_file('data/SSC_2016_AUST.shp')

suburb_dataset = suburb_dataset[suburb_dataset['STE_NAME16'] == 'New South Wales']

suburb_dataset = suburb_dataset[suburb_dataset['geometry'] != None]

print(suburb_dataset.shape)

suburb_dataset.plot_bokeh()