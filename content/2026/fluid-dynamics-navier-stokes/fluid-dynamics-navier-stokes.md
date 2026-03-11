Title: Simulating Fluid Dynamics on a Grid
Date: 2026-03-11
Author: Jack McKew
Category: Python
Tags: python, simulation, fluid-dynamics, navier-stokes, pygame, physics

I implemented Jos Stam's "Real-Time Fluid Dynamics for Games" paper and watched ink swirl realistically through water without solving a single differential equation properly. The result is visually convincing enough to pass a quick glance - and the math is elegant in its wrongness.

Here's the thing: this isn't physically accurate fluid simulation. It's a clever hack that *looks* right, runs fast, and is accessible enough that I could build it in an evening.

## The Core Idea

Discretize space into a grid. Each cell stores:
- Velocity (u, v components)
- Density (concentration of "stuff" - ink, smoke, etc.)

Each frame, perform three operations:
1. **Advection** - move densities along velocity field
2. **Diffusion** - densities spread to neighbours (viscosity)
3. **Pressure solve** - project velocity to stay divergence-free (incompressibility)

Stam's genius: use semi-implicit backwards advection + multigrid for pressure. Stable even with large timesteps.

## Implementation

```python
import numpy as np
import pygame

class FluidGrid:
    def __init__(self, width, height, cell_size=1):
        self.width = width // cell_size
        self.height = height // cell_size
        self.cell_size = cell_size

        self.u = np.zeros((self.height, self.width))  # Velocity X
        self.v = np.zeros((self.height, self.width))  # Velocity Y
        self.density = np.zeros((self.height, self.width))

        self.u_prev = np.zeros_like(self.u)
        self.v_prev = np.zeros_like(self.v)
        self.density_prev = np.zeros_like(self.density)

    def advect(self, field, vel_x, vel_y, dt=0.1):
        """Semi-implicit advection: trace backwards along velocity"""
        result = np.zeros_like(field)
        for i in range(self.height):
            for j in range(self.width):
                # Backtrace: where did this cell come from?
                x = j - dt * vel_x[i, j]
                y = i - dt * vel_y[i, j]

                # Clamp to grid
                x = max(0, min(self.width - 1, x))
                y = max(0, min(self.height - 1, y))

                # Bilinear interpolation
                x0, y0 = int(x), int(y)
                x1, y1 = min(x0 + 1, self.width - 1), min(y0 + 1, self.height - 1)
                sx, sy = x - x0, y - y0

                result[i, j] = (
                    (1 - sx) * (1 - sy) * field[y0, x0] +
                    sx * (1 - sy) * field[y0, x1] +
                    (1 - sx) * sy * field[y1, x0] +
                    sx * sy * field[y1, x1]
                )

        return result

    def diffuse(self, field, diffusion_rate=0.0001, dt=0.1):
        """Diffusion via Gauss-Seidel iteration"""
        a = diffusion_rate * dt * (self.width - 2) ** 2
        result = field.copy()

        for _ in range(20):  # Iterations for Gauss-Seidel
            for i in range(1, self.height - 1):
                for j in range(1, self.width - 1):
                    result[i, j] = (
                        field[i, j] +
                        a * (result[i-1, j] + result[i+1, j] +
                             result[i, j-1] + result[i, j+1]) /
                        (1 + 4 * a)
                    )

        return result

    def project(self, vel_x, vel_y, dt=0.1):
        """Pressure projection to enforce incompressibility (simplified)"""
        # Calculate divergence
        div = np.zeros_like(vel_x)
        for i in range(1, self.height - 1):
            for j in range(1, self.width - 1):
                div[i, j] = (
                    -(vel_x[i, j+1] - vel_x[i, j-1] +
                      vel_y[i+1, j] - vel_y[i-1, j]) / 2
                )

        # Pressure solve (Gauss-Seidel)
        pressure = np.zeros_like(div)
        for _ in range(20):
            for i in range(1, self.height - 1):
                for j in range(1, self.width - 1):
                    pressure[i, j] = (
                        div[i, j] +
                        (pressure[i-1, j] + pressure[i+1, j] +
                         pressure[i, j-1] + pressure[i, j+1])
                    ) / 4

        # Subtract pressure gradient from velocity
        vel_x_new = vel_x.copy()
        vel_y_new = vel_y.copy()
        for i in range(1, self.height - 1):
            for j in range(1, self.width - 1):
                vel_x_new[i, j] -= (pressure[i, j+1] - pressure[i, j-1]) / 2
                vel_y_new[i, j] -= (pressure[i+1, j] - pressure[i-1, j]) / 2

        return vel_x_new, vel_y_new

    def step(self, dt=0.1):
        """Single simulation step"""
        # Advect velocity (self-convection)
        self.u = self.advect(self.u, self.u, self.v, dt)
        self.v = self.advect(self.v, self.u, self.v, dt)

        # Diffuse velocity
        self.u = self.diffuse(self.u, diffusion_rate=0.0001, dt=dt)
        self.v = self.diffuse(self.v, diffusion_rate=0.0001, dt=dt)

        # Project to enforce incompressibility
        self.u, self.v = self.project(self.u, self.v, dt)

        # Advect density
        self.density = self.advect(self.density, self.u, self.v, dt)

        # Diffuse density
        self.density = self.diffuse(self.density, diffusion_rate=0.0001, dt=dt)

    def add_source(self, x, y, amount=1.0):
        """Add density at a point"""
        if 0 <= x < self.width and 0 <= y < self.height:
            self.density[int(y), int(x)] += amount

    def add_velocity(self, x, y, vx, vy):
        """Add velocity at a point"""
        if 0 <= x < self.width and 0 <= y < self.height:
            self.u[int(y), int(x)] += vx
            self.v[int(y), int(x)] += vy
```

## Rendering and Interaction

```python
def main():
    pygame.init()
    width, height = 800, 600
    screen = pygame.display.set_mode((width, height))
    clock = pygame.time.Clock()

    grid = FluidGrid(width, height, cell_size=1)

    running = True
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

        # Add density and velocity at mouse position
        mouse_x, mouse_y = pygame.mouse.get_pos()
        if pygame.mouse.get_pressed()[0]:  # Left click
            grid.add_source(mouse_x, mouse_y, amount=100.0)
            # Add velocity in direction of mouse movement
            prev_x, prev_y = getattr(main, 'prev_mouse', (mouse_x, mouse_y))
            grid.add_velocity(mouse_x, mouse_y, mouse_x - prev_x, mouse_y - prev_y)
            main.prev_mouse = (mouse_x, mouse_y)

        grid.step(dt=0.1)

        # Render density as greyscale
        display = (grid.density * 255).astype(np.uint8)
        surface = pygame.surfarray.make_surface(display.T)
        screen.blit(surface, (0, 0))

        pygame.display.flip()
        clock.tick(60)

    pygame.quit()

if __name__ == "__main__":
    main()
```

Run this and drag your mouse across the screen. You'll see inky plumes swirl, merge, and dissipate. It's mesmerizing.

## The Honest Bit

This isn't solving Navier-Stokes correctly. A real physicist would wince at the pressure projection simplification. But here's the secret: for visuals, you don't need physics accuracy. You need plausibility.

The approximations trade accuracy for speed and stability. Backwards advection with bilinear interpolation is stable with large timesteps. The pressure solve is a cheap hack (should be multigrid or proper solver). Diffusion via Gauss-Seidel converges slowly but it's Good Enough.

What blew me away: how little you can get away with. The visual result is convincing even though the math is deliberately wrong.

## Tweaks That Matter

- **Diffusion rate**: Lower = sharper features, higher = mushy/viscous
- **Pressure iterations**: More iterations = more incompressible flow (slower)
- **Advection order**: I used bilinear interpolation. MacCormack advection reduces dissipation but needs two backtrace passes
- **Grid resolution**: Higher resolution = more detail (and more compute)
- **Boundary conditions**: I used zero-Neumann (no flow out). Try Dirichlet (fixed values) for different effects

## Where This Fails

- Temperature/buoyancy (smoke rises) - needs additional scalar field
- Vorticity (swirling) - lost in pressure projection, can add back with vorticity confinement
- Splashing/two-phase flow - completely different problem
- Very high Reynolds numbers (turbulent flow) - needs dissipation subgrid models

For games and VFX, this method is industry standard. For CFD research, you'd use proper solvers (OpenFOAM, etc.).

The takeaway: sometimes the wrong tool is exactly right for the job.
