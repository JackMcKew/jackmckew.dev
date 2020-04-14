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
# display(lga_dataset['NSW_LGA__3'].tolist())
# display(nsw_covid.pivot_table())
count_df = gpd.pd.pivot_table(nsw_covid,'notification_date','lhd_2010_name',aggfunc='count')

# %%
# display(count_df)
count_df.index = count_df.index.map(str.upper)
lga_dataset['NSW_LGA__3'].name = 'LGA_NAME'
lga_dataset.index = lga_dataset['NSW_LGA__3']
count_df.index.name = 'LGA_NAME'

#%%
joined_df = count_df.join(lga_dataset,'LGA_NAME')
display(joined_df)

#%%
joined_df.plot_bokeh()

# %%
