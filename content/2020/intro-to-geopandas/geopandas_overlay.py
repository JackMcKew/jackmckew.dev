#%%
import geopandas
from shapely.geometry import Polygon

p1 = Polygon([(0, 0), (1, 0), (1, 1), (0, 1)])
p2 = Polygon([(0, 0), (1, 0), (1, 1)])
p3 = Polygon([(2, 0), (3, 0), (3, 1), (2, 1)])

gdf = geopandas.GeoDataFrame(columns=['geometry'],data=[p1,p2,p3])

gdf['Data'] = {0: 0, 1: 1,2:2}

display

gdf.plot(cmap='viridis',edgecolor='black',alpha=0.8)
# %%
