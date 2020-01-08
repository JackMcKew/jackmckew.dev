#%%
import geopandas as gpd, pandas as pd
from shapely.geometry import Point

p1 = Point((1,2))

p2 = Point((5,6))
df = pd.DataFrame({'a': [11,22],'b':[33,44]})
gdf = gpd.GeoDataFrame(df, geometry = [p1,p2])
buffer = gdf.buffer(2)
buffer.plot()
envelope = buffer.envelope  
envelope.plot()
# gdf.plot()

# %%
c1 = Point(1, 0).buffer(1)
c2 = Point(.5, 0).buffer(1)

gdf = gpd.GeoDataFrame(dict(A=[1, 2], B=[3, 4]), geometry=[c1, c2])

gdf.plot()

# %%
