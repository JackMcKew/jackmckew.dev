Title: Bokeh vs Plotly vs Matplotlib vs RGL vs Altair
Date: 2026-03-10
Author: Jack McKew
Category: Python
Tags: bokeh, plotly, matplotlib, altair, visualisation, comparison

I've spent the last five years fighting with these libraries, and I finally have opinions worth sharing.

Everyone asks "which visualisation library should I use?" and the answer is always "it depends," which is useless. So here's the non-useless version: what I actually reach for, why, and where each one annoys me most.

## Matplotlib

Matplotlib is the foundation. It's been around since 2003, and it shows. It's a plotting library that thinks like MATLAB - you draw lines, add axes, set properties. It's procedural and fiddly.

**Use it for:**
- Static publication-quality plots for papers
- Quick exploratory graphs when you don't care about interactivity
- Custom plots where you need pixel-perfect control
- Any plot that needs to work offline, in notebooks, in PDFs

**Why it sucks:**
- 3D plots are terrible. Seriously. The `mplot3d` toolkit exists but it's slow and visually dated.
- Interactive plots require `%matplotlib notebook` or `%matplotlib widget` in Jupyter, and the experience is laggy.
- Layout debugging is a nightmare. Subplots, spacing, legend positioning - it all requires trial and error.
- The API is inconsistent. Sometimes you use `plt.`, sometimes `ax.`, sometimes `fig.`. New users get lost.

**The honest take:** Use matplotlib when you need a PNG or PDF to put in a paper. That's it. It's the workhorse for static publishing, but everything else has moved past it.

## Plotly

Plotly generates interactive JavaScript plots. You build a figure with Python, it renders as a web-based interactive chart. Zoom, pan, hover tooltips, all built-in.

**Use it for:**
- Dashboards (Plotly Dash is full-stack)
- Interactive exploration in Jupyter notebooks
- 3D plots that need to be zoomable and rotatable
- Business intelligence reports
- Quick prototypes that need to look polished

**Why it sucks:**
- Performance degrades with large datasets (10k+ points). It's fine for 1-5k, then it stalls.
- 3D rendering is JavaScript-based, not optimized for scientific visualization.
- Customization is deep but unintuitive. The `go.Figure` API is verbose.
- Exporting to static images requires `kaleido`, which is another dependency and another thing to debug.

**The honest take:** Plotly is the sweet spot for interactive dashboards and business charts. It looks professional out of the box. I reach for it every time I need to show someone an interactive graph they can click around in.

## Bokeh

Bokeh is the misunderstood middle child. It's a Python visualization library that also generates JavaScript, but it's designed for linked interactivity and server-side callbacks. You can build it as a static HTML export or run it on a server.

**Use it for:**
- Linked brushing and selection (selecting points in one plot highlights them in another)
- Server-side dashboards with callbacks
- Publication-quality static plots (it exports beautifully)
- When you need fine-grained control over interaction
- Real-time streaming data plots

**Why it sucks:**
- The learning curve is steep. The API is big and not always intuitive.
- Layout debugging is painful. Getting two plots side-by-side with the same height requires reading the docs.
- 3D support is non-existent. Don't even try.
- The server mode has a callback model that's different from JavaScript - it's server-side logic, which is powerful but unfamiliar to most people.
- Documentation is scattered and sometimes outdated.

**The honest take:** Bokeh is genuinely the best choice if you need linked selections and brushing. That feature alone is worth it for exploratory data analysis. But if you just want a pretty interactive chart, Plotly is faster.

## Altair

Altair is a Python wrapper around Vega-Lite, a declarative visualization grammar. You describe what you want in JSON-like syntax, and Altair renders it.

**Use it for:**
- Building plots from data transformations (Altair has a powerful selection and filtering API)
- Small-to-medium datasets (thousands of points, not millions)
- Interactive, linked charts that don't require a server
- When you want to think in terms of data grammar rather than procedural API calls
- Altair's `alt.selection()` is genuinely elegant for interactivity

**Why it sucks:**
- Performance cliff. Beyond 5k points, it struggles.
- Customization is limited. Vega-Lite's grammar is powerful but finite - some plots just can't be expressed.
- 3D is off the table.
- Debugging is harder because you're working with a declarative spec, not imperative code.

**The honest take:** Altair is for data journalists and analysts. It's not for scientists or engineers. If your plot can be expressed as a Vega-Lite spec, Altair is beautiful. Otherwise, you'll spend hours fighting the grammar.

## RGL (R's 3D Graphics)

RGL is R's OpenGL-based 3D graphics library. I'm including it because some of you work in R, and RGL is genuinely good at what it does.

**Use it for:**
- Scientific 3D visualization in R
- Volumetric rendering and mesh manipulation
- Real-time interactive 3D that needs to be fast
- Anything where you're rotating meshes or point clouds in real time

**Why it works:**
- It's OpenGL-based, so it's native and fast.
- The API is simple: `plot3d()`, `points3d()`, `surface3d()`.
- Interactivity is built-in and snappy.

**Why Python users don't use it:**
- You have to use R. That's it.

**The honest take:** If you're in R, use RGL. If you're in Python, you're stuck with either Plotly (slower, web-based) or Mayavi (complex, but good).

## The Decision Tree

Here's what I actually do:

1. **Do I need a static plot for a paper?** → Matplotlib
2. **Do I need interactivity and it's 3D?** → Plotly
3. **Do I need linked brushing/selection?** → Bokeh
4. **Do I need a small, elegant, linked interactive chart?** → Altair
5. **Do I need real-time streaming data?** → Bokeh server
6. **Do I not know what I need yet?** → Matplotlib to explore, then upgrade

## What I Actually Use Most

Honestly? Matplotlib for exploration, Plotly for dashboards, Bokeh for research visualization. Altair for one-offs. They're not competing - they're solving different problems.

The mistake most people make is choosing one and trying to force every plot into it. Pick the right tool for the job. Matplotlib is great for papers. Plotly is great for stakeholders. Bokeh is great for interactive analysis. Altair is great for data stories.

And if you find yourself fighting a library for hours, you probably picked the wrong one.

![Library comparison - performance, features, and decision tree]({static}images/library_comparison.png)
