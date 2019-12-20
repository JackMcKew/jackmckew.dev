Title: Python for the Finance Industry
Date: 2019-04-12 06:30
Category: Python, Data Science
Author: Jack McKew
Tags: python, finance
Slug: python-for-the-finance-industry
Status: published

This is the first post in a series of posts dedicated for demonstrating how Python can be applied in the finance industry. Personally, the first thing that comes to mind when I think of the finance industry is the stock market. For fellow Australians, our main stock exchange is the Australian Securities Exchange (ASX). For those who are reading who are not familiar with stocks, there is a plethora of information around stocks across the internet.

When it comes to using Python with stocks, the very first thing that you will require, is data. Thankfully, there are multitudes of services out there which provide this data through application programming interfaces (APIs). The data is provided through APIs in a few common formats:

-   JSON,
-   XML,
-   CSV.

For this post, I will be utilising the free service, Alpha Vantage, to request historical records of stock information on the ASX. For access to Alpha Vantage’s API, head to <http://www.alphavantage.co/support/#api-key> and register for a free API key. There is also documentation around testing if your API key is operational on the Alpha Vantage website.

Now that we have access to an API in which we can extract historical records of stock information in the ASX, it’s time to manipulate and analyse the data. As in my previous post [Episode 8 – Anaconda](https://jmckew.com/2019/01/11/episode-8-anaconda/), I recommend setting up a virtual environment or anaconda environment to install & manage dependencies of external libraries.

The packages required for this post in the series are:

-   [Pandas](https://pandas.pydata.org/) (For manipulating the data),
-   [Alpha\_vantage](https://github.com/RomelTorres/alpha_vantage) (To access the historical records through an API),
-   [NumPy](https://www.numpy.org/) (For processing across the data),
-   [Matplotlib](https://matplotlib.org/) (For visualising and generate plots of the data).

To import these libraries into our Python code the following\
code is required:

``` python
import pandas as pd
from alpha_vantage.timeseries import TimeSeries
import matplotlib.pyplot as plt
import numpy as np
```

Now that we have imported the packages required to extract,\
process and display the data. The first step is to extract the data in a useful\
format from the Alpha Vantage API.

First declare a list with all the companies ASX names with the suffix “.AX” to denominate that it’s from the ASX. After that initialise an empty pandas dataframe to be filled with the data to analyse. Now iterate over the list, calling a request through the API to request the data that is required. There are multiple formats of data to be extracted through the API which is detailed in the [Alpha\_Vantage documentation](https://alpha-vantage.readthedocs.io/en/latest/). For this post, I have used the get\_daily function from the timeseries object in alpha\_vantage to extract the daily information on a stock for the past 20 years, in particular, the closing value.

``` python
companies = ['NAB.AX','WOW.AX','TLS.AX','BHP.AX']

stocks_df = pd.DataFrame()

for company in companies:
    data, meta_data = ts.get_daily(symbol=company,outputsize='full')
    print(data.head())
    stocks_df[company] = pd.Series(data['4. close'])

print(stocks_df.head())
```

![stocks_listing]({static img/image2.png})

Now that the dataframe is full of closing values for the companie’s stock’s closing values, it’s time to begin processing. First of all, for any missing data or erroneous 0 values, the ffill() function is used to fill any missing value by propagating the last valid observation forward. After that, the timestamp on each row is forced to become the index of the dataframe and converted to a datetime type.

``` python
stocks_df = stocks_df.replace(0,pd.np.nan).ffill()
stocks_df.index = pd.to_datetime(stocks_df["date"])
stocks_df = stocks_df.drop("date",axis=1)
```

Now that the data has gone through it’s pre-processing phase, it’s time to begin plotting some figures. To begin, a basic figure, plotting a single for each company’s stock price over the past 20 years on a single line graph to enable comparison between the companies.

``` python
plt.figure(figsize=(14,7))
    for column in stocks_df.columns.values:
        plt.plot(stocks_df.index,stocks_df[column],lw=3,alpha=0.8,label=c)
plt.legend(loc='upper left',fontsize=12)
plt.ylabel('price in $')
plt.show()
```

![line_graph]({static img/Figure_1-1.png})
Another way to plot this data is to show it as the percentage change from the day before AKA daily returns. By plotting the data in this way, instead of showing the actual prices, the graph is showing the stocks’ volatility.

``` python
returns = stocks_df.pct_change()

plt.figure(figsize=(14,7))
for column in returns.columns.values:
    plt.plot(returns.index,returns[column],lw=3,alpha=0.8,label=c)
plt.legend(loc='upper left',fontsize=12)
plt.ylabel('daily returns')
plt.show()
```

![percent_change]({static img/Figure_2.png})

Now that we have some insight to the stocks’ data, the next post in this series will demonstrate a way to calculate a balanced portfolio from historical records using Modern Portfolio Theory.