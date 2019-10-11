Title: Episode 3 - Open Mind
Date: 2018-12-07 03:10
Author: admin
Tags: database, selfimprovement
Slug: episode-3-open-mind
Status: published

While it always may seem to be easiest to keep using what you've always used in the past, sometimes it pays off to keep an open mind about how you approach problems.

Recently was asked to create a database with minute interval data from 600-700 data recording stations for up to the past 60 years, truly a lot of a data to handle.

My first pass over was to use the python pandas module, with great success, however iterating over the data sets took around a week. By looking out for new ways to tackle problems, I was able to increase the speed 450 times faster by using dask to parallelize my data frames and multiprocessing allowing multiple workers to work across many cores of the PC. This meant going from around 60,000 rows per second to 1.5 million rows/second and 18 workers at one time.

For the next version I am planning to investigate how to utilize influxDB and Apache Spark/Hadoop to try and optimize this process further.
