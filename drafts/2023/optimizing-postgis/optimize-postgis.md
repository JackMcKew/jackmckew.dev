Title: Optimization Gotchas in PostGIS for Geospatial Queries
Date: 2023-02-26
Author: Jack McKew
Category: Databases
Tags: databases

This post will go through how techniques that are intended to speed up geospatial queries for PostGIS, sometimes have the opposite effect. The origin of this post came from building a system to evaluate whether a point was on the water or not, so we'll use that as our datasource for this problem:

- [Oceans](https://osmdata.openstreetmap.de/download/water-polygons-split-4326.zip)

# Load

To ensure a reproducible example, we'll use Docker to host our postgis database locally. After docker is installed and running on your machine, run the line:

`docker run --name docker-postgis --platform linux/amd64 -e POSTGRES_PASSWORD=root -e DB_HOST=docker.for.mac.host.internal -d -p 5432:5432 postgis/postgis`

Now we've got a postgis instance running on our machine, let's connect to it and upload the files we've just downloaded. We're going to use `ogr2ogr` to load the data into our postgis instance.

`ogr2ogr -f "PostgreSQL" PG:"dbname=postgres user=postgres password=root host=localhost" "water_polygons.shp" -progress -overwrite -nlt PROMOTE_TO_MULTI -nln water`

## Generate points

Now that we have our polygons loaded into a table, we need to generate points to be evaluated:

``` sql
CREATE TABLE IF NOT EXISTS points (
    wkb_geometry geometry
);
INSERT INTO points
SELECT ST_GeneratePoints(wkb_geometry, 1, 42)
FROM water;
```

## Baseline test

Our baseline test of a point in polygon spatial join: count how many points are within each polygon, can demonstrate the effectiveness of indexing, point in polygon calculations and general overhead. By using the `EXPLAIN ANALYZE` operator in PostgreSQL, we can look into the inner workings of how the database plans and executes the query, along with how long the query took. We'll also take only 50% of the points as querying the entire table defeats the purpose of this task.

``` sql
EXPLAIN ANALYZE SELECT count(*), w.ogc_fid
FROM water w
JOIN (select *
from points tablesample bernoulli (50)) p
ON ST_Intersects(w.wkb_geometry, p.wkb_geometry)
GROUP BY w.ogc_fid;
```

By running without any of the following optimizations, we get the result of:

``` text
"HashAggregate  (cost=3817704.60..3818238.05 rows=53345 width=12) (actual time=39005.387..39021.370 rows=27103 loops=1)"
"  Group Key: w.ogc_fid"
"  Batches: 1  Memory Usage: 3857kB"
"  ->  Nested Loop  (cost=0.28..3809633.50 rows=1614220 width=4) (actual time=1041.207..38943.773 rows=28254 loops=1)"
"        ->  Sample Scan on points  (cost=0.00..747.60 rows=30260 width=32) (actual time=1038.104..1068.915 rows=26552 loops=1)"
"              Sampling: bernoulli ('50'::real)"
"        ->  Index Scan using water_wkb_geometry_geom_idx on water w  (cost=0.28..125.82 rows=5 width=20034) (actual time=1.186..1.424 rows=1 loops=26552)"
"              Index Cond: (wkb_geometry && points.wkb_geometry)"
"              Filter: st_intersects(wkb_geometry, points.wkb_geometry)"
"              Rows Removed by Filter: 0"
"Planning Time: 21.229 ms"
"JIT:"
"  Functions: 13"
"  Options: Inlining true, Optimization true, Expressions true, Deforming true"
"  Timing: Generation 6.770 ms, Inlining 225.750 ms, Optimization 480.290 ms, Emission 330.523 ms, Total 1043.333 ms"
"Execution Time: 39036.766 ms"
```

# Optimize Techniques

## Set the page size

Kudos to Paul Ramsey [source](http://blog.cleverelephant.ca/2018/09/postgis-external-storage.html) for demonstrating the effectiveness of setting the page size for postgresql (and by extension PostGIS). As the default for postgresql is to use a set amount of page size of internal memory, this results in the database only allowed to use a set amount of memory to process queries which inherently does not leverage the computing power that we have on our machines. By allowing postgresql to use external memory, this not only leverages the memory available but should also improve our query performance.

``` sql
ALTER TABLE water
ALTER COLUMN wkb_geometry
SET STORAGE EXTERNAL;
-- Force the column to update
UPDATE water
SET wkb_geometry = ST_SetSRID(wkb_geometry, 4326);
```

By running the baseline test again:

``` text
"GroupAggregate  (cost=4728732.94..4731547.98 rows=67460 width=12) (actual time=40087.106..40138.918 rows=27205 loops=1)"
"  Group Key: w.ogc_fid"
"  ->  Sort  (cost=4728732.94..4729446.42 rows=285392 width=4) (actual time=40086.611..40094.963 rows=28418 loops=1)"
"        Sort Key: w.ogc_fid"
"        Sort Method: quicksort  Memory: 769kB"
"        ->  Nested Loop  (cost=0.28..4698970.24 rows=285392 width=4) (actual time=505.690..40070.221 rows=28418 loops=1)"
"              ->  Sample Scan on points  (cost=0.00..711.72 rows=26672 width=40) (actual time=504.890..533.400 rows=26692 loops=1)"
"                    Sampling: bernoulli ('50'::real)"
"              ->  Index Scan using water_wkb_geometry_geom_idx on water w  (cost=0.28..176.08 rows=7 width=20034) (actual time=1.191..1.478 rows=1 loops=26692)"
"                    Index Cond: (wkb_geometry && points.wkb_geometry)"
"                    Filter: st_intersects(wkb_geometry, points.wkb_geometry)"
"                    Rows Removed by Filter: 0"
"Planning Time: 39.037 ms"
"JIT:"
"  Functions: 12"
"  Options: Inlining true, Optimization true, Expressions true, Deforming true"
"  Timing: Generation 7.761 ms, Inlining 44.777 ms, Optimization 283.510 ms, Emission 175.701 ms, Total 511.750 ms"
"Execution Time: 40152.000 ms"
```

> This has slowed down the query by **2.8589%**!

## Create a spatial index

One technique that should always be used in databases is indexing, especially for geospatial databases. Creating an index on our database is as simple as:

``` sql
CREATE INDEX geometry_index ON water USING GIST(wkb_geometry);
```

This works by computing the bounding box of each geometry in the dataset, and whenever a query comes in that wishes to evaluate against the geometries (ie, intersection), the query resolver will first reduce the query only to geometries which bounding box first passes the query before continuing to include the entire geometry.

``` text
"GroupAggregate  (cost=3386133.27..3388370.65 rows=53345 width=12) (actual time=44326.518..44378.392 rows=27336 loops=1)"
"  Group Key: w.ogc_fid"
"  ->  Sort  (cost=3386133.27..3386701.25 rows=227191 width=4) (actual time=44326.259..44334.503 rows=28513 loops=1)"
"        Sort Key: w.ogc_fid"
"        Sort Method: quicksort  Memory: 769kB"
"        ->  Nested Loop  (cost=0.28..3362812.60 rows=227191 width=4) (actual time=467.546..44311.772 rows=28513 loops=1)"
"              ->  Sample Scan on points  (cost=0.00..711.72 rows=26672 width=40) (actual time=466.846..495.109 rows=26779 loops=1)"
"                    Sampling: bernoulli ('50'::real)"
"              ->  Index Scan using geometry_index on water w  (cost=0.28..126.00 rows=5 width=22430) (actual time=1.380..1.634 rows=1 loops=26779)"
"                    Index Cond: (wkb_geometry && points.wkb_geometry)"
"                    Filter: st_intersects(wkb_geometry, points.wkb_geometry)"
"                    Rows Removed by Filter: 0"
"Planning Time: 37.141 ms"
"JIT:"
"  Functions: 12"
"  Options: Inlining true, Optimization true, Expressions true, Deforming true"
"  Timing: Generation 7.900 ms, Inlining 45.958 ms, Optimization 265.176 ms, Emission 154.866 ms, Total 473.900 ms"
"Execution Time: 44391.401 ms"
```

> This has slowed down by **13.7181%** compared to the original query!

# Conclusion

By doing these techniques that intended to improve query performance, we actually had the opposite effect! This highlights how important it is to check the impact on performance of adding optimizations!

> This was done on an 2023 Apple MacBook Pro with 32GB memory.