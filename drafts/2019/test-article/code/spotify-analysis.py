#%%
import pandas as pd

# %%
streaming_data_0 = pd.read_json('MyData/StreamingHistory0.json')
streaming_data_1 = pd.read_json('MyData/StreamingHistory1.json')

merged_streaming_data = pd.concat([streaming_data_0,streaming_data_1],axis=0)

# %%

summed_df = merged_streaming_data.groupby('artistName')['msPlayed'].sum()


# merged_streaming_data
summed_df['Horrorshow'] / 1000 / 60 / 60
#%%
summary_df = pd.DataFrame()
summary_df['Count'] = merged_streaming_data.artistName.value_counts()
# summary_df['Count'] = merged_streaming_data.loc[merged_streaming_data.idxmax()].max()# %%


summary_df.head(5).plot.bar()

# %%
