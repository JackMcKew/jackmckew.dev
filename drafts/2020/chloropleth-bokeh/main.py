#%%
import geopandas as gpd
import pandas_bokeh
# pandas_bokeh.output_file('LGA.html')
pandas_bokeh.output_notebook()

#%%
suburb_dataset = gpd.read_file('data/Suburbs/SSC_2016_AUST.shp')

suburb_dataset = suburb_dataset[suburb_dataset['STE_NAME16'] == 'New South Wales']

suburb_dataset = suburb_dataset[suburb_dataset['geometry'] != None]

lga_dataset = gpd.read_file('data/LGA/NSW_LGA_POLYGON_shp.shp')

lga_dataset = lga_dataset[lga_dataset['NSW_LGA__3'] != 'UNINCORPORATED']

#%%
# https://www.matthewproctor.com/full_australian_postcodes_nsw
postcode_dataset = gpd.pd.read_csv('data/postcode-data.csv')

# %%
import urllib.request, json 
with urllib.request.urlopen("https://data.nsw.gov.au/data/api/3/action/package_show?id=aefcde60-3b0c-4bc0-9af1-6fe652944ec2") as url:
    data = json.loads(url.read().decode())
    # print(data)
# covid_dataset = gpd.pd.read_json('https://data.nsw.gov.au/data/api/3/action/package_show?id=aefcde60-3b0c-4bc0-9af1-6fe652944ec2')

# %%
covid_nsw_data_url = data['result']['resources'][0]['url']

nsw_covid = gpd.pd.read_csv(covid_nsw_data_url)

#%%
nsw_covid = nsw_covid.dropna()
nsw_covid['postcode'] = nsw_covid['postcode'].astype(int)
display(nsw_covid)
# nsw_covid['postcode'] = nsw_covid.dropna()

# nsw_covid['postcode'] = nsw_covid['postcode'].apply(lambda x: int(x))

#%%
# display(lga_dataset['NSW_LGA__3'].tolist())
# display(nsw_covid.pivot_table())
count_df = gpd.pd.pivot_table(nsw_covid,'notification_date','postcode',aggfunc='count')



count_df.rename(columns={'notification_date':'number_of_confirmed_cases'}, inplace=True)

display(count_df)
#%%
joined_df = count_df.join(postcode_dataset,'postcode')
display(joined_df)

#%%
# joined_df.plot_bokeh()
print(type(joined_df))
# from geopandas import GeoDataFrame
from shapely.geometry import Point

geometry = [Point(xy) for xy in zip(joined_df.Longitude, joined_df.Latitude)]
joined_df = joined_df.drop(['Longitude', 'Latitude'], axis=1)
crs = {'init': 'epsg:4326'}
joined_gdf = gpd.GeoDataFrame(joined_df, crs=crs, geometry=geometry)
display(joined_gdf)
# %%
joined_gdf.plot_bokeh()

# %%
