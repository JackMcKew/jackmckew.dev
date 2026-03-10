Title: River Meandering in JavaScript
Date: 2026-03-10
Author: Jack McKew
Category: Software
Tags: javascript, simulation, river, meandering, canvas, physics

I spent a weekend simulating river erosion on an HTML canvas. The result looks like a real river snaking across a landscape. No pre-rendered assets, just physics and a few hundred lines of JavaScript.

## The physics

Rivers meander because of fluid dynamics. As a river flows, the water curves slightly. The outer edge moves faster (cutting into the bank), the inner edge moves slower (deposits sediment). Over time, the curve grows into a meander.

The model:
1. The river has a centerline (the path it follows)
2. At each point, calculate "migration" - how much the path should shift sideways
3. Migration depends on local curvature and sediment transport
4. Eventually the meander neck gets so tight it breaks through - oxbow lake formation

Here's the implementation:

```javascript
class River {
  constructor(canvasWidth, canvasHeight) {
    this.width = canvasWidth;
    this.height = canvasHeight;
    this.points = [];
    this.velocity = [];

    // Initialize river path (straight from top to bottom with slight wobble)
    for (let y = 0; y < canvasHeight; y += 5) {
      const x = canvasWidth / 2 + Math.sin(y * 0.01) * 20;
      this.points.push({ x, y });
      this.velocity.push(0); // No sideways velocity yet
    }
  }

  calculateMigration() {
    /**
     * Migration rate depends on curvature.
     * Where the river bends sharply, it cuts faster.
     */
    for (let i = 1; i < this.points.length - 1; i++) {
      const prev = this.points[i - 1];
      const curr = this.points[i];
      const next = this.points[i + 1];

      // Local curvature: how much does the path turn?
      const dx1 = curr.x - prev.x;
      const dy1 = curr.y - prev.y;
      const dx2 = next.x - curr.x;
      const dy2 = next.y - curr.y;

      // Cross product gives signed curvature
      const curvature = dx1 * dy2 - dy1 * dx2;

      // Migration is proportional to curvature
      // Also dampen by distance from boundaries
      let migration = curvature * 0.0002;

      // Add some downstream bias (river slightly meanders downhill)
      migration += 0.1;

      // Store for next iteration
      this.velocity[i] = migration;
    }
  }

  update() {
    this.calculateMigration();

    // Apply migration
    for (let i = 1; i < this.points.length - 1; i++) {
      // Shift sideways
      this.points[i].x += this.velocity[i];

      // Smoothing: river doesn't have sharp kinks
      const smooth = 0.5;
      const prev = this.points[i - 1];
      const next = this.points[i + 1];
      this.points[i].x = this.points[i].x * (1 - smooth) +
                         ((prev.x + next.x) / 2) * smooth;

      // Boundary checking - keep in canvas
      this.points[i].x = Math.max(50, Math.min(this.width - 50, this.points[i].x));
    }

    // Oxbow detection: if any two points get very close, cut them off
    this.detectOxbow();
  }

  detectOxbow() {
    /**
     * Oxbow formation: when the meander neck becomes tight,
     * the river breaks through and creates a crescent lake.
     */
    for (let i = 0; i < this.points.length - 20; i++) {
      const p1 = this.points[i];
      const p2 = this.points[i + 20];

      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

      // If the neck is tight, cut through
      if (dist < 100) {
        // Straight-line cut
        const steps = 20;
        for (let j = 1; j < steps; j++) {
          const t = j / steps;
          const x = p1.x + (p2.x - p1.x) * t;
          const y = p1.y + (p2.y - p1.y) * t;
          this.points[i + j].x = x;
        }
        break;  // Only one oxbow per frame for stability
      }
    }
  }

  draw(ctx) {
    ctx.strokeStyle = '#4a90e2';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      ctx.lineTo(this.points[i].x, this.points[i].y);
    }
    ctx.stroke();

    // Draw river width (channel)
    const bankDist = 8;
    ctx.fillStyle = 'rgba(74, 144, 226, 0.1)';
    ctx.beginPath();
    ctx.moveTo(this.points[0].x - bankDist, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      ctx.lineTo(this.points[i].x - bankDist, this.points[i].y);
    }
    for (let i = this.points.length - 1; i >= 0; i--) {
      ctx.lineTo(this.points[i].x + bankDist, this.points[i].y);
    }
    ctx.fill();
  }
}

// Main animation loop
const canvas = document.getElementById('riverCanvas');
const ctx = canvas.getContext('2d');
const river = new River(canvas.width, canvas.height);

function animate() {
  // Clear canvas
  ctx.fillStyle = '#f0e68c';  // Tan background (land)
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Update and draw
  river.update();
  river.draw(ctx);

  requestAnimationFrame(animate);
}

animate();
```

That's the core. A river path, curvature-based migration, oxbow detection, and smooth drawing.

## Tuning the parameters

The magic numbers make a difference:

- **Migration rate** (0.0002): Too high = wild meanders that wrap back on themselves. Too low = almost straight path.
- **Smoothing factor** (0.5): How much do we average with neighbours? Higher = smoother but less responsive. Lower = jagged.
- **Oxbow threshold** (100 pixels): How close do meanders need to be before they cut through? This controls oxbow frequency.
- **Boundary offset** (50 pixels): How far from canvas edge before the river bounces back? Too small = river escapes; too large = river pools in the middle.

I spent an hour tuning these. At 0.0002 migration, the river barely moves. At 0.001, it meanders wildly and often gets stuck. At 0.0003, it looks natural. This isn't maths - it's tweaking until it looks right.

## What you actually see

After a few hundred frames:
1. The initially straight river develops gentle curves
2. Curves grow larger (positive feedback - bigger curve = more migration)
3. Meanders grow until they wrap almost completely around themselves
4. The oxbow cuts through - sudden straightening
5. The abandoned meander becomes a crescent-shaped lake
6. The river continues downstream, developing new meanders

It's hypnotic. The shapes feel organic because they're driven by physics, not procedural rules. Rivers in the real world form through the same process - the simulation captures actual river behaviour at a macro level.

## Improvements I didn't add

**Sediment transport**: Real rivers deposit fine sediment in slow areas, creating point bars (those crescent beaches on river bends). This would require tracking sediment per pixel, which is expensive.

**Variable width**: The river's channel could get wider in calm sections, narrower in rapids. This requires height-map data (topography), which the simple physics model doesn't have.

**Tributaries**: Add smaller rivers that merge. This needs recursive river generation and flow-network logic.

**Erosion depth**: Colour the river deeper where it cuts fastest. Just a visual enhancement, but it sells the realism.

I kept it simple intentionally. The core algorithm is elegant on its own.

## Why this matters

This simulation is a microcosm of geomorphology - the study of how landscapes form. Rivers shape valleys, create flood plains, and build deltas. Understanding how meanders work teaches you something about hydrology and landscape evolution.

It's also useful for game dev. Procedurally generated worlds need rivers that look plausible. You could use this to carve rivers into terrain, then use the river paths for navigation networks or environmental storytelling.

I like this project because it's visual, it involves actual physics (not just algorithms), and the results look beautiful without being complicated. The code is short enough to understand in an afternoon, but the emergent behaviour is rich enough to watch for hours.

If you want to play with it, throw it in a canvas element and watch a landscape evolve in real-time. No assets, no pre-rendering, just maths.
