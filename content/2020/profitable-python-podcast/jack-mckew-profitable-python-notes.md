Title: Profitable Python Podcast - Show Notes
Date: 2020-07-10
Author: Jack McKew
Category: Software, Data Science
Tags: software, datascience

I was recently a guest on the Profitable Python podcast with host Ben McNeill, the episode can be found at: <https://anchor.fm/profitablepythonfm/episodes/Pandas-Alive--Jack-McKew-efui92/a-a2idber>. This blog post serves as the show notes, if I've missed anything, please drop a comment below!

## Projects Mentioned

A project where the team was investigating the air quality impacts of air show smoke cans. The scenario was where the planes were mounted with smoke cans which leave a trail of smoke behind them while they fly around and complete stunts. We were given the flight path from the black box in GPX format, and the air quality team modelled the scenario per second to export a contour. This contour and flight path data was then passed into [Plotly](https://plotly.com/) and an interactive visualisation was created. In particular the contour was shown at a fixed height using 3D scatter while the flight path was displayed using lines.

One of my first experiences automating a real task with Python was in my first engineering position, where we were creating human machine interaces (HMI) for dams & weirs using [Vijeo](https://www.se.com/ww/en/product-range/1054-vijeo-designer/). I was tasked with placing buttons on the screens for each and every spillway. As this was monotonous and there was lots of buttons, I decided to automate it. In particular I used [`pyautogui`](https://pyautogui.readthedocs.io/en/latest/). The script mimicked the mouse and keyboard dragging and dropping the buttons onto the screen and worked a treat.

After I had been writing this blog for some time, I wanted to count the number of words I had written. These posts are spread across markdown & jupyter notebooks, so I set out to create a Python package to count this figure for me. I have done a previous write up on how this package was created at <https://jackmckew.dev/counting-words-with-python.html>. The package `wordsum` can also be installed via `pip install wordsum` : <https://pypi.org/project/wordsum/>. This is how the figure on each page is calculated, and is integrated into TravisCI to update the value whenever the site is built.

In Home Appliance Scheduler Using Home Area Network, this was my engineering thesis, which can be read in full at: <https://jackmckew.dev/pages/Final_Year_Project_Part_B.pdf>. In particular I used a multi-objective evolutionary algorithm (MOEA) to optimise the price of electricity over a 24hr period by shifting the time when appliances start.

## Other Mentions

LEGO Mindstorms <https://www.lego.com/en-au/product/lego-mindstorms-ev3-31313>. I was a participant in [RoboCup Junior](https://www.robocupjunior.org.au/) when I was in high school and built a LEGO team to play soccer.

AlphaGo documentary <https://www.youtube.com/watch?v=WXuK6gekU1Y>. *With more board configurations than there are atoms in the universe, the ancient Chinese game of Go has long been considered a grand challenge for artificial intelligence. On March 9, 2016, the worlds of Go and artificial intelligence collided in South Korea for an extraordinary best-of-five-game competition, coined The DeepMind Challenge Match. Hundreds of millions of people around the world watched as a legendary Go master took on an unproven AI challenger for the first time in history.*

## Concepts

Openly sharing learning journey - don't be scared to show your mistakes.

Users typically don't care how your software works, just as long as it works.

Building passive income(s), gives you more time in the day to pursue what you enjoy.

Scalability is core to making a business become extremely profitable.

If you want to gain a skill, start by spending at least 5 minutes on something a day. In a month, you'll be much further ahead then if you keep putting it off.

Spend more time upfront when discovering a client's problem. Answer the who, what, why, where and how of the problem statement, will make your life much easier. Get constant feedback and engage with your clients as you are building the solution. This will open up many more avenues for future work as well.

Demonstrate value in time saved vs upfront cost. It's much easier to sell that someone will save $10,000/year every year going forward than $25,000 upfront to solve it.

Put yourself in the shoes of the end-user of a data visualisation. If you can relate with your end-users, the data visualisation will be much more engaging. Look out for more examples out there, and note what you like/disliked with the visualisation.

The more simple & relatable you can make something, the more it will be appreciated. Use relatable analogies if you can!

Don't feel ashamed to stop something if you aren't engaging with it. If you're halfway through a book and it's not serving you, don't feel any guilt in stopping.

Live for today, not the past or the present.

### Python Packages

- Gooey - <https://github.com/chriskiehl/Gooey>
- PyInstaller - <https://www.pyinstaller.org/>
- Bokeh - <https://docs.bokeh.org/en/latest/index.html>
- Plotly - <https://plot.ly/python/>
- Matplotlib - <https://matplotlib.org/>
- Pandas-Bokeh - <https://github.com/PatrikHlobil/Pandas-Bokeh>
- Folium - <https://python-visualization.github.io/folium/quickstart.html>
- Black - <https://github.com/psf/black>
- Pandas_Alive - <https://github.com/JackMcKew/pandas_alive>
- Poetry - <https://python-poetry.org/>

### Resources

- Crowd Fight COVID-19 - <http://crowdfightcovid19.org/volunteers>
- Automate the Boring Stuff - <https://automatetheboringstuff.com/>
- Jake VanderPlas Python data visualisation ecosystem - <https://www.youtube.com/watch?v=FytuB8nFHPQ>
- Vega & Vega-lite - <https://vega.github.io/vega-lite/>
- Vladimir Illevski Javascript data visualisation ecosystem - <https://medium.com/analytics-vidhya/javascript-visualization-discover-different-visualization-tools-part-1-e4a77595fb97>
- Courage to be Disliked - <https://jackmckew.dev/book-review-courage-to-be-disliked.html#book-review-courage-to-be-disliked>
- Never Split the Difference - <https://jackmckew.dev/book-review-never-split-the-difference.html>
- Apache Airflow - <https://airflow.apache.org/>
- Harry Stevens - <https://www.washingtonpost.com/graphics/2020/world/corona-simulator/>
- Sourcery - <https://sourcery.ai/>
- Hunter Data Analytics - <http://data.newwwie.com/>
- ShareX - <https://getsharex.com/>
- Dropbox moving to Rust from Python - <https://dropbox.tech/infrastructure/rewriting-the-heart-of-our-sync-engine>