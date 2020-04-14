#%%
import geopandas as gpd
import pandas_bokeh
# pandas_bokeh.output_file('LGA.html')
pandas_bokeh.output_notebook()

suburb_dataset = gpd.read_file('data/Suburbs/SSC_2016_AUST.shp')

suburb_dataset = suburb_dataset[suburb_dataset['STE_NAME16'] == 'New South Wales']

suburb_dataset = suburb_dataset[suburb_dataset['geometry'] != None]

lga_dataset = gpd.read_file('data/LGA/NSW_LGA_POLYGON_shp.shp')

lga_dataset = lga_dataset[lga_dataset['NSW_LGA__3'] != 'UNINCORPORATED']


# %%
suburb_dataset.iloc[:3,:].plot_bokeh()

# %%
