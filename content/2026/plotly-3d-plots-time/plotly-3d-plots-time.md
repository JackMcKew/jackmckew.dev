Title: Plotly 3D Plots with Time
Date: 2026-03-10
Author: Jack McKew
Category: Python
Tags: plotly, 3d, visualisation, animation, data-science

Built an animated 3D scatter plot the other day that showed a trajectory evolving through time. Sounds simple, right? It's not, but Plotly makes it less painful than you'd expect.

The key thing about time-based 3D plots is that you're showing how something moves or changes across all three spatial dimensions while keeping time separate. You can either bake time into the animation (play it like a movie) or add it as a slider that lets you scrub through.

Let me walk through what actually works and where Plotly stumbles.

## Animated 3D Scatter with Frames

Here's the pattern that works best. I'm going to use a simple example: a particle moving through 3D space over 100 time steps.

```python
import plotly.graph_objects as go
import numpy as np

# Generate trajectory data - a helix moving upward
time_steps = 100
t = np.linspace(0, 4 * np.pi, time_steps)
x = np.cos(t)
y = np.sin(t)
z = np.linspace(0, 10, time_steps)

# Create frames - one per time step
frames = []
for i in range(time_steps):
    frame = go.Frame(
        data=[
            go.Scatter3d(
                x=x[:i+1],
                y=y[:i+1],
                z=z[:i+1],
                mode='lines+markers',
                marker=dict(size=4, color=z[:i+1], colorscale='Viridis'),
                line=dict(width=2)
            )
        ],
        name=str(i)
    )
    frames.append(frame)

# Initial data
fig = go.Figure(
    data=[
        go.Scatter3d(
            x=[x[0]],
            y=[y[0]],
            z=[z[0]],
            mode='markers',
            marker=dict(size=4)
        )
    ],
    frames=frames
)

fig.update_layout(
    scene=dict(
        xaxis=dict(range=[-1.5, 1.5]),
        yaxis=dict(range=[-1.5, 1.5]),
        zaxis=dict(range=[0, 10])
    ),
    updatemenus=[
        dict(
            type='buttons',
            showactive=False,
            buttons=[
                dict(label='Play', method='animate', args=[None, dict(frame=dict(duration=50, redraw=True), fromcurrent=True)]),
                dict(label='Pause', method='animate', args=[[None], dict(frame=dict(duration=0), mode='immediate')])
            ]
        )
    ],
    sliders=[{
        'active': 0,
        'steps': [
            {'args': [[f.name], dict(frame=dict(duration=50, redraw=True), mode='immediate')],
             'method': 'animate',
             'label': str(i)} for i, f in enumerate(frames)
        ]
    }]
)

fig.show()
```

This works because each frame is a complete dataset at that moment in time. You hit play and Plotly cycles through, updating the traces. The slider lets you jump to any point. For 100 frames, this is snappy. For 1000+, it starts to lag.

The gotcha: frames are expensive. Each frame contains the full data up to that point. If you're tracking 10,000 particles, you'll notice the slowdown fast.

## Surface Plots Over Time

Surfaces are trickier because you can't just append data. You need to rebuild the mesh each frame.

```python
import plotly.graph_objects as go
import numpy as np

# Create a surface that oscillates
u = np.linspace(-2, 2, 50)
v = np.linspace(-2, 2, 50)
U, V = np.meshgrid(u, v)

frames = []
for time_offset in np.linspace(0, 2*np.pi, 40):
    Z = np.sin(np.sqrt(U**2 + V**2) + time_offset) * np.cos(time_offset)

    frame = go.Frame(
        data=[
            go.Surface(
                x=U,
                y=V,
                z=Z,
                colorscale='Plasma',
                showscale=False
            )
        ],
        name=str(time_offset)
    )
    frames.append(frame)

fig = go.Figure(
    data=[
        go.Surface(
            x=U,
            y=V,
            z=np.sin(np.sqrt(U**2 + V**2)),
            colorscale='Plasma'
        )
    ],
    frames=frames
)

fig.update_layout(
    scene=dict(
        zaxis=dict(range=[-2, 2])
    ),
    updatemenus=[
        dict(
            type='buttons',
            buttons=[
                dict(label='Play', method='animate', args=[None, dict(frame=dict(duration=100))]),
                dict(label='Pause', method='animate', args=[[None], dict()])
            ]
        )
    ]
)

fig.show()
```

Again, each frame is the entire surface. Plotly recalculates the WebGL mesh for every frame. It's smooth for 40-50 frames but degrades beyond that.

## Plotly Express vs Graph Objects

Plotly Express has `px.scatter_3d()` with `animation_frame` and `animation_group` parameters. Sounds convenient.

```python
import plotly.express as px
import pandas as pd

# Create trajectory data
df = pd.DataFrame({
    'time': np.repeat(range(100), 50),
    'x': np.tile(np.random.normal(0, 1, 50), 100),
    'y': np.tile(np.random.normal(0, 1, 50), 100),
    'z': np.tile(np.random.normal(0, 1, 50), 100),
})

fig = px.scatter_3d(
    df,
    x='x', y='y', z='z',
    animation_frame='time',
    animation_group='time'
)

fig.show()
```

This works, but it's inflexible. You lose fine-grained control over frame timing, slider behavior, and what gets redrawn. I'd avoid it for anything beyond a quick prototype. Graph Objects gives you the power you actually need.

## Performance Reality Check

Here's what I've learned:

- **Under 50 frames, 1000 points**: Silky smooth, no worries.
- **50-200 frames, 5000+ points**: Noticeable lag when dragging/rotating between frames. Acceptable for a presentation.
- **200+ frames, 10000+ points**: It struggles. Seriously.

If you need true real-time animation, you're looking at WebGL directly or a specialized tool like VTK. Plotly's sweet spot is publication-quality static views and small-to-medium animated sequences.

## Where It Falls Apart

Plotly's 3D is JavaScript-based (built on `plotly.js`). It's not optimized for:

- **Large meshes**: Deform a 100k-vertex mesh in each frame and you'll hit the wall.
- **Custom shaders**: You're stuck with Plotly's built-in rendering. No custom depth-of-field, no volumetric fog.
- **True interactivity during animation**: You can't have the animation playing while you're also dragging the scene.
- **Transparency depth sorting**: 3D transparency in web graphics is hard. Plotly handles it, but it's inconsistent.

For those cases, Three.js or Babylon.js directly is the move. More work, but you get what you need.

## The Honest Take

Plotly 3D with time is genuinely useful for:

- Scientific simulations (particle systems, molecular dynamics, fluid flow)
- Robot trajectory visualization
- Financial surfaces (volatility over time)
- Any dataset where you want to show change across three dimensions without losing clarity

It's not perfect. The animation model is a bit clunky, and the performance ceiling is real. But it's the path of least resistance if you want a nice 3D plot with temporal interactivity without writing WebGL yourself.

For most of my projects, I use it. When I hit the limits, I reach for specialized tools. That's the pragmatic approach.
