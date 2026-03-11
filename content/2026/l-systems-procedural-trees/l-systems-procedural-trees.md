Title: Drawing Trees with L-Systems
Date: 2026-03-11
Author: Jack McKew
Category: Python
Tags: python, generative-art, l-systems, turtle-graphics, procedural-generation

I've been obsessed with procedural generation lately, and L-systems are the cleanest way I've found to generate plant-like structures. Feed in a rewriting rule, apply it 5-6 times, interpret as turtle graphics commands - and suddenly you have trees that look genuinely natural, not mechanical.

The beautiful part: different plant species are just different rule sets. It's like biological code.

## What's an L-System?

L-systems (Lindenmayer systems) model plant growth through string rewriting. Start with an axiom (initial string), repeatedly apply production rules, interpret the final string as drawing commands.

Example:

```
Axiom: A
Rules:
  A -> B-A-B
  B -> A+B+A
Angle: 90 degrees
```

Generation 0: A
Generation 1: B-A-B
Generation 2: A+B+A - B - B-A-B - A+B+A
Generation 3: (gets longer)
...

Interpret as turtle graphics:
- A, B: move forward
- +: turn right by angle
- -: turn left by angle
- [: push position to stack
- ]: pop position from stack (backtrack)

## Simple Example: The Dragon Curve

```python
def generate_lsystem(axiom, rules, iterations):
    current = axiom
    for _ in range(iterations):
        next_gen = ""
        for char in current:
            if char in rules:
                next_gen += rules[char]
            else:
                next_gen += char
        current = next_gen
    return current

# Dragon curve
axiom = "FX"
rules = {
    'X': 'X+YF+',
    'Y': '-FX-Y'
}

sequence = generate_lsystem(axiom, rules, 10)
print(sequence[:100])  # Shows the expansion
```

Now interpret with turtle graphics:

```python
import turtle
import math

def draw_lsystem(sequence, angle=90, distance=5, initial_angle=0):
    turtle.speed(0)
    stack = []
    turtle.setheading(initial_angle)

    for char in sequence:
        if char == 'F':
            turtle.forward(distance)
        elif char == '+':
            turtle.right(angle)
        elif char == '-':
            turtle.left(angle)
        elif char == '[':
            stack.append((turtle.xcor(), turtle.ycor(), turtle.heading()))
        elif char == ']':
            if stack:
                x, y, heading = stack.pop()
                turtle.penup()
                turtle.goto(x, y)
                turtle.setheading(heading)
                turtle.pendown()

turtle.setup(width=800, height=600)
screen = turtle.Screen()
turtle.pendown()

sequence = generate_lsystem("FX", {'X': 'X+YF+', 'Y': '-FX-Y'}, 10)
draw_lsystem(sequence, angle=90, distance=2)

turtle.hideturtle()
turtle.done()
```

Run this and you get the dragon curve - a fractal with beautiful self-similarity.

## A More Realistic Tree

Here's where it gets fun. Different rules = different plant shapes:

```python
# Classic binary tree
axiom = "0"
rules = {
    '0': '1[0]0',
    '1': '11'
}
angle = 45

# Fractal plant
axiom = "X"
rules = {
    'X': 'F+[[X]-X]-F[-FX]+X',
    'F': 'FF'
}
angle = 25

# Branching structure (looks like seaweed)
axiom = "F"
rules = {
    'F': 'F[+F]F[-F]F'
}
angle = 30
```

Each has a completely different visual character, just by changing the rewriting rule. The axiom is the seed, the rules are the DNA.

## Adding Randomness

Perfectly geometric trees look artificial. Real plants have variation:

```python
import random

def draw_lsystem_stochastic(sequence, angle=90, distance=5, angle_jitter=5):
    """Add randomness to angles and distances"""
    turtle.speed(0)
    stack = []

    for char in sequence:
        if char == 'F':
            jittered_distance = distance + random.uniform(-distance*0.1, distance*0.1)
            turtle.forward(jittered_distance)
        elif char == '+':
            jittered_angle = angle + random.uniform(-angle_jitter, angle_jitter)
            turtle.right(jittered_angle)
        elif char == '-':
            jittered_angle = angle + random.uniform(-angle_jitter, angle_jitter)
            turtle.left(jittered_angle)
        elif char == '[':
            stack.append((turtle.xcor(), turtle.ycor(), turtle.heading()))
        elif char == ']':
            if stack:
                x, y, heading = stack.pop()
                turtle.penup()
                turtle.goto(x, y)
                turtle.setheading(heading)
                turtle.pendown()
```

Now each tree is unique. Same rules, different random variations - just like real trees.

## The "Aha" Moment

When I first added the `[` and `]` branching operators, I generated a tree with proper Y-branch structure - not a straight trunk with branches, but actual branches splitting into sub-branches recursively. No explicit recursion in my code. It emerged from the rewriting rule and the stack.

That's when it clicked: these simple rules can model complex biological growth.

## Real-World Plants

These aren't just pretty fractals. Real botanists have used L-systems to model actual plants:

```python
# Approximation of a maple leaf structure
axiom = "S"
rules = {
    'S': 'F[+FF][-FF]S',
    'F': 'S[//&F][/\\&F]'
}

# Bush-like structure (Sierpinski triangle variant)
axiom = "A"
rules = {
    'A': '+B-A-B+',
    'B': '-A+B+A-'
}
```

Different angles, different iterations, different rule sets - and you can approximate everything from ferns to trees to corals.

## Gotchas

- **Stack depth**: Deep nesting of `[` and `]` means stack grows. For complex plants, this is necessary but limit iterations or stack blows up.
- **String length explosion**: Each iteration potentially multiplies string length. `X -> X+X` doubles each iteration. By generation 10, you've got 2^10 = 1024 characters. Generation 15 hangs the interpreter.
- **Turtle graphics is slow**: For complex sequences, rendering is the bottleneck. Use matplotlib or custom graphics for faster preview.
- **Angle precision**: Small angle differences create wildly different shapes. 25 degrees looks like a plant. 26 degrees looks wrong.

## Extending Further

- **Stochasticity in rules**: Instead of deterministic rewriting, use probability. "A -> A with 70% probability, B otherwise" models growth variation.
- **3D rendering**: Replace turtle graphics with 3D turtle (rotation matrices). Same rule system, now you're generating 3D plants.
- **Parametric L-systems**: Add parameters to rules. `F(x) -> F(x*1.1)` means segments shrink down the branches (realistic taper).
- **Environmental interaction**: Rules that respond to "light" or "moisture" - bending growth toward resources.

## Why This Matters

L-systems are a bridge between mathematics and biology. They show how simple algorithms can produce complex, aesthetically pleasing forms. For game dev, procedural art, or just understanding how nature codes itself - they're essential.

And they're fun. Tweak an angle, regenerate, get a completely different tree. That feedback loop is addictive.
