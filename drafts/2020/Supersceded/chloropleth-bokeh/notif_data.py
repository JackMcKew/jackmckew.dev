#%%#%%
from typing import MutableMapping
import geopandas as gpd

#%%
suburb_dataset = gpd.read_file("data/Suburbs/SSC_2016_AUST.shp")

suburb_dataset = suburb_dataset[suburb_dataset["STE_NAME16"] == "New South Wales"]

suburb_dataset = suburb_dataset[suburb_dataset["geometry"] != None]

lga_dataset = gpd.read_file("data/LGA/NSW_LGA_POLYGON_shp.shp")

lga_dataset = lga_dataset[lga_dataset["NSW_LGA__3"] != "UNINCORPORATED"]

#%%
# https://www.matthewproctor.com/full_australian_postcodes_nsw
postcode_dataset = gpd.pd.read_csv("data/postcode-data.csv")

# %%
import urllib.request, json

with urllib.request.urlopen(
    "https://data.nsw.gov.au/data/api/3/action/package_show?id=aefcde60-3b0c-4bc0-9af1-6fe652944ec2"
) as url:
    data = json.loads(url.read().decode())
    # print(data)
# covid_dataset = gpd.pd.read_json('https://data.nsw.gov.au/data/api/3/action/package_show?id=aefcde60-3b0c-4bc0-9af1-6fe652944ec2')

# %%
covid_nsw_data_url = data["result"]["resources"][0]["url"]

nsw_covid = gpd.pd.read_csv(covid_nsw_data_url)

#%%
nsw_covid = nsw_covid.fillna(9999)
nsw_covid["postcode"] = nsw_covid["postcode"].astype(int)
display(nsw_covid)

#%%
nsw_covid["Latitude"] = (
    nsw_covid["postcode"]
    .map(postcode_dataset.set_index("Postcode")["Latitude"].to_dict())
    .fillna(-36.860723)
)

nsw_covid["Longitude"] = (
    nsw_covid["postcode"]
    .map(postcode_dataset.set_index("Postcode")["Longitude"].to_dict())
    .fillna(153.592843)
)
# nsw_covid = nsw_covid.fillna(9999)

display(nsw_covid)

#%%

melted_nsw = nsw_covid.melt(
    id_vars=["notification_date", "postcode"], value_vars=["Longitude", "Latitude"]
)

drop_dupes = melted_nsw.drop_duplicates()

lat_pivot = (
    gpd.pd.pivot_table(
        drop_dupes,
        values="value",
        index="notification_date",
        columns="postcode",
        aggfunc="min",
    )
    .ffill()
    .bfill()
)


lon_pivot = (
    gpd.pd.pivot_table(
        drop_dupes,
        values="value",
        index="notification_date",
        columns="postcode",
        aggfunc="max",
    )
    .ffill()
    .bfill()
)

display(lat_pivot)

display(lon_pivot)

#%%
print(nsw_covid["notification_date"])
grouped_df = nsw_covid.groupby(["notification_date", "postcode"]).size()

print(grouped_df.values.sum())

grouped_df = gpd.pd.DataFrame(grouped_df).unstack()

grouped_df.columns = grouped_df.columns.droplevel().astype(str)

grouped_df = grouped_df.fillna(0)

grouped_df.index = gpd.pd.to_datetime(grouped_df.index)

# grouped_df = grouped_df[:-1]

display(grouped_df)

# import matplotlib.pyplot as plt

# grouped_df.plot()
# plt.show()
grouped_df.to_csv("grouped.csv")

#%%

# https://stackoverflow.com/questions/46960864/combine-multiple-pandas-dataframes-into-a-multi-index-dataframe

combine_dfs = [grouped_df, lat_pivot, lon_pivot]

keys = ["Cases", "Latitude", "Longitude"]

multi_index_df = gpd.pd.concat(combine_dfs, keys=keys, axis=1)

display(multi_index_df)

multi_index_df.to_csv("multi.csv")

#%%
# https://stackoverflow.com/questions/25929319/how-to-iterate-over-pandas-multiindex-dataframe-using-index

level_keys = multi_index_df.columns.get_level_values(level=0).unique().tolist()

# print(level_keys)

display(multi_index_df[level_keys[1]].iloc[0].values)

# for i, new_df in multi_index_df.groupby(level=0):
#     for column_key in level_keys:

#         display(new_df[column_key])

# display(multi_index_df)

# grouped_df.to_csv('test.csv')

#%%
import pandas_alive

bar_chart = grouped_df.sum(axis=1).plot_animated(
    kind="bar", width=0.1, period_label=False, title="New Cases"
)

line_chart = (
    grouped_df.sum(axis=1)
    .diff()
    .fillna(0)
    .plot_animated(kind="line", period_label=False, title="Change since Previous Day")
)

race_chart = grouped_df.cumsum().plot_animated(n_visible=5, title="Cases by Postcode")


#%%
# import matplotlib.pyplot as plt

# plt.tight_layout()

# max_val = grouped_df.index.max().strftime("%d/%m/%Y")

import time

timestr = time.strftime("%d/%m/%Y")

pandas_alive.animate_multiple_plots(
    "test.mp4",
    [race_chart, bar_chart, line_chart],
    title=f"NSW COVID-19 Confirmed Cases up to {timestr}",
    adjust_subplot_top=0.85,
    adjust_subplot_hspace=0.5,
)

# display(grouped_df.cumsum())


# %%
