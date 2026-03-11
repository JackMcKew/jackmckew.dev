Title: Bokeh Dashboard
Date: 2026-03-10
Author: Jack McKew
Category: Python
Tags: bokeh, dashboard, data-visualisation, python, widgets

Built a real-time dashboard with Bokeh last week. It's the kind of project that looks simple until you're debugging the layout for an hour and wondering why the callbacks aren't firing.

Here's what actually works, what's annoying, and where Bokeh genuinely shines.

## The Basic Setup

A Bokeh dashboard is a Python app that runs on a Tornado server. You define plots, widgets, and callbacks, and Bokeh handles the interactivity. When the user clicks a button or adjusts a slider, it fires a callback on the server side.

Let me build a simple example: a dashboard with a plot and a dropdown to filter data.

```python
from bokeh.plotting import curdoc, figure
from bokeh.layouts import column, row
from bokeh.models import ColumnDataSource, Select, Div
from bokeh.palettes import Category20
import pandas as pd
import numpy as np

# Generate sample data
np.random.seed(42)
dates = pd.date_range('2025-01-01', periods=100)
categories = ['A', 'B', 'C', 'D']
data = {
    'date': np.repeat(dates, 4),
    'category': categories * 100,
    'value': np.random.normal(100, 15, 400),
}
df = pd.DataFrame(data)

# Create a ColumnDataSource - this is the bridge between Python and JavaScript
source = ColumnDataSource(df)

# Create the plot
plot = figure(
    title='Time Series by Category',
    x_axis_type='datetime',
    width=800,
    height=400
)

# Add a line for each category
for i, category in enumerate(categories):
    cat_data = df[df['category'] == category]
    plot.line(cat_data['date'], cat_data['value'],
              legend_label=category,
              color=Category20[4][i],
              line_width=2)

# Create a dropdown widget
select = Select(
    title='Filter:',
    value='All',
    options=[('All', 'All')] + [(cat, cat) for cat in categories]
)

# Define the callback
def on_select_change(attr, old, new):
    if new == 'All':
        filtered = df
    else:
        filtered = df[df['category'] == new]

    # Update the source
    source.data = ColumnDataSource.from_df(filtered).data

select.on_change('value', on_select_change)

# Layout
layout = column(select, plot)

# Add to document
curdoc().add_root(layout)
```

Run this with `bokeh serve script.py`, navigate to `localhost:5006`, and you've got an interactive dashboard.

## The Widget System

Bokeh has a full widget library: sliders, buttons, text inputs, dropdowns, radio buttons, date pickers. They all work the same way:

```python
from bokeh.models import (
    Button, DateSlider, RangeSlider, TextInput,
    Spinner, RadioGroup, ColorBar
)
from datetime import datetime

button = Button(label='Click me')
slider = RangeSlider(start=0, end=100, value=(20, 80), step=1)
date_picker = DateSlider(title='Pick a date:', value=datetime(2025, 1, 1))
text_input = TextInput(title='Search:', value='')
spinner = Spinner(title='Count:', value=1, step=1)
radio = RadioGroup(labels=['Option A', 'Option B', 'Option C'], active=0)

# Callbacks
def on_button_click():
    print('Button clicked!')

button.on_click(on_button_click)

def on_slider_change(attr, old, new):
    print(f'Range changed: {new}')

slider.on_change('value', on_slider_change)
```

The pattern is consistent: bind a callback to the widget using `on_change()` or `on_click()`. The callback receives the attribute name, old value, and new value.

## Linked Selections

This is where Bokeh gets genuinely clever. You can select points in one plot and have them highlight in another without writing server callbacks.

```python
from bokeh.models import HoverTool
import numpy as np

# Create shared data with two sets of columns
n = 200
shared_data = dict(
    x=np.random.normal(0, 1, n),
    y=np.random.normal(0, 1, n),
    x2=np.random.normal(0, 1, n),      # different projection
    y2=np.random.normal(0, 1, n),
)

# Same ColumnDataSource for both plots - this is the key
source = ColumnDataSource(shared_data)

# Create two plots with selection tools
plot1 = figure(width=400, height=400, tools='box_select,lasso_select,pan,wheel_zoom,reset')
plot2 = figure(width=400, height=400, tools='pan,wheel_zoom,reset')

# Both plots reference the same source
plot1.circle('x', 'y', source=source, size=8, selection_color='orange', nonselection_alpha=0.3)
plot2.circle('x2', 'y2', source=source, size=8, selection_color='orange', nonselection_alpha=0.3)

# Optional: log selections
source.selected.on_change('indices', lambda attr, old, new: print(f'Selected {len(new)} points'))

# Now when you box-select points in plot1, they highlight in both
layout = row(plot1, plot2)
curdoc().add_root(layout)
```

Honestly, this is the feature that makes Bokeh worth using. Plotly doesn't have this out of the box. Altair does, but with less power.

## Layout Debugging

Bokeh's layout system is straightforward in concept: `row()` and `column()` stack things horizontally or vertically. In practice, it's a nightmare.

```python
from bokeh.layouts import column, row, gridplot, Spacer

# Simple row
layout = row(plot1, plot2)

# Nested layout
layout = column(
    row(title_widget, button),
    row(plot1, plot2),
    row(sidebar, main_plot)
)

# Grid layout - specify rows
layout = gridplot(
    [[plot1, plot2], [plot3, plot4]],
    toolbar_location='right'
)
```

The issue: sizing. By default, plots fill available space, but if you have uneven content, things misalign. You need to set explicit widths and heights on everything, and even then, Bokeh sometimes decides to ignore you.

```python
plot1 = figure(width=400, height=400)
plot2 = figure(width=400, height=300)  # Different height
plot3 = figure(width=400, height=300)

# This won't align nicely
layout = gridplot([[plot1, plot2], [plot3, None]])
```

The workaround: give everything explicit dimensions and use spacers to pad:

```python
from bokeh.models import Spacer, Div

plot1 = figure(width=400, height=400)
plot2 = figure(width=400, height=400)
sidebar = Div(width=200, height=400, text="<h2>Sidebar</h2>")

layout = row(sidebar, column(plot1, plot2))
```

This takes trial and error. There's no magic here.

## Server Callbacks

The callback model is server-side Python, which is different from client-side JavaScript. When the user interacts, the browser sends a message to the server, Python runs your callback, and the server sends back updated data.

This is powerful but has latency. You feel it with 100ms+ round trips.

```python
from bokeh.models import ColumnDataSource
import time
import numpy as np

# source and slider defined elsewhere in your app
def expensive_callback(attr, old, new):
    # This runs on the server
    print(f'Slider changed to {new}, recomputing...')
    time.sleep(2)  # Simulate a slow database query or computation

    # Update the ColumnDataSource - Bokeh pushes the diff to the browser
    filtered = df[df['value'] > new]
    source.data = ColumnDataSource.from_df(filtered)

slider.on_change('value', expensive_callback)
```

The user slides, waits, sees the update. It's responsive enough for dashboards where updates take a few seconds (database queries, computations), but not for real-time interaction like drawing or dragging.

## Performance Tips

Bokeh dashboards can slow down with large datasets:

- **Use ColumnDataSource instead of redrawing**: Change `source.data` instead of calling `plot.circle()` again.
- **Limit the data**: Filter to a reasonable size before passing to the plot. Don't try to render 100k points.
- **Use WebSocket instead of HTTP**: In `bokeh serve`, use `--allow-websocket-origin` for smoother updates.
- **Avoid heavy computations in callbacks**: Offload to a database query if possible.

## The Honest Take

Bokeh is best for:

- **Research dashboards** where interactivity matters - linked selections, filtering, exploration.
- **Data-heavy applications** where you need server-side logic.
- **Teams that know Python** - it's all Python, no JavaScript.

Bokeh struggles with:

- **Layout complexity** - if your design has lots of nested rows/columns with varied sizing, you'll spend hours debugging.
- **Custom styling** - you can use CSS, but it's fragile.
- **Real-time or fast-response interaction** - the server round-trip adds latency.
- **3D** - doesn't exist.

If you need a quick dashboard for a stakeholder, use Plotly or Streamlit. If you need linked brushing and server-side callbacks, Bokeh is your best bet. Build it, accept the layout pain, and move on.

That's the pragmatic approach. Bokeh is solid, just not frictionless.
