Title: Intro to Games in Python with Pyglet
Date: 2019-10-04 06:30
Author: Jack McKew
Tags: python, pyglet
Slug: intro-to-games-in-python-with-pyglet
Status: published

Recently, I've been researching ways that I could run a 2D simulation (and hopefully 3D) with many moving pieces and there was a desire to make it interactive as well. I stumbled through many visualisation frameworks such as:

-   [p5](https://pypi.org/project/p5/)
-   [pygame](https://www.pygame.org/news)
-   [plotly](https://plot.ly/)
-   [panda3d](https://www.panda3d.org/)
-   [bokeh](https://bokeh.pydata.org/en/latest/)
-   many others

Eventually, through the motivation of another side project (looking into training neural networks to learn how to play games) and inspired by this video from Code Bullet <https://www.youtube.com/watch?v=r428O_CMcpI>; I decided on attempting to use [Pyglet](https://pyglet.readthedocs.io/en/stable/) to do these simulations.

While the aforementioned simulations won't be covered in this post, this post aims to demonstrate how I adapted the [in-depth tutorial on the Pyglet website](https://pyglet.readthedocs.io/en/stable/programming_guide/examplegame.html) (which goes through how to recreate asteroids in Pyglet) to generate vector based objects which can crash into each other.

First off as always, start by setting up a virtual environment with your preferred method ([Anaconda](https://jmckew.com/2019/01/11/episode-8-anaconda/) or [follow my workflow](https://jmckew.com/2019/08/30/python-project-workflow/)), since Pyglet has no external dependencies, all you need to do is install the pyglet package.

I won't go through all the code in the example, and how it works, I will only go through what I changed in the case to get where I wanted to go.

To begin, and make things a bit easier, I downloaded the pyglet-master repository from GitHub (<https://github.com/pyglet/pyglet>) so I didn't have to create and copy the file contents one by one.

After going through the different versions with the examples \> game folder, I decided all I required was the simple functionality of collision and any further into developing the game wasn't needed for this stage, so I copied out the version 3 folder.

If we run 'asteroid.py' from within the version 3 folder, we are met with this screen

![full_game_screen](..\img\intro-to-games-in-python-with-pyglet\image.png)

Now since all I am trying to do is generate multiple objects (which will be shown with the player symbol to indicate direction), I can comment out the lines which give the lives, score, title and interactive player.

``` python
# Set up the two top labels
# score_label = pyglet.text.Label(text="Score: 0", x=10, y=575, batch=main_batch)
# level_label = pyglet.text.Label(text="Version 3: Basic Collision",
#                                 x=400, y=575, anchor_x='center', batch=main_batch)

# Initialize the player sprite
# player_ship = player.Player(x=400, y=300, batch=main_batch)

# Make three sprites to represent remaining lives
# player_lives = load.player_lives(2, main_batch)

# Make three asteroids so we have something to shoot at 
# asteroids = load.asteroids(3, player_ship.position, main_batch)

asteroids = load.asteroids(100,(window_width//2,window_height//2),main_batch)

# Store all objects that update each frame in a list
# game_objects = [player_ship] + asteroids
game_objects = asteroids

# Tell the main window that the player object responds to events
# game_window.push_handlers(player_ship.key_handler)
```

Now that we've done that, we need to modify the asteroids generator function to use the player sprite.

In load.py, you can change simply the img argument to the player image sprite reference like so:

``` python
new_asteroid = physicalobject.PhysicalObject(img=resources.player_image,                                                     x=asteroid_x, y=asteroid_y,                                                 batch=batch)
```

Now if we run this, the animation will look a little off, because the objects won't be traveling the direction in the direction that the sprite is pointing. This is due to the existing velocity calculation being a random number for both the X and Y component.

To make the player sprites move in the direction they are rotated in, and maintain the existing codebase, we will need to convert from [polar notation to cartesian](https://www.mathsisfun.com/polar-cartesian-coordinates.html).

To do this, we add an extra 2 functions into 'util.py' which will do this for us:

``` python
def cart2pol(x, y):
    rho = math.sqrt(x**2 + y**2)
    phi = math.arctan2(y, x)
    return(rho, phi)

def pol2cart(rho, phi):
    x = rho * math.sin(math.radians(phi))
    y = rho * math.cos(math.radians(phi))
    return(x, y)
```

Note the use of radians in pol2cart, this is due to the [affect of quadrants and trigonometric functions](https://www.sparknotes.com/math/trigonometry/trigonometricfunctions/section3/). I won't go into detail, but it won't behave like you expect it to.

Now to get our player sprites moving in the direction they are rotated, update the code which generates the 'asteroids' to utilise our new function:

``` python
new_asteroid.rotation = random.randint(0, 360)
new_asteroid.velocity_speed = random.random() * 40
new_asteroid.velocity_x, new_asteroid.velocity_y = util.pol2cart(new_asteroid.velocity_speed,new_asteroid.rotation)
```

Now when we go and run our main file again, we will met with a screen like this:

![boids_screen](..\img\intro-to-games-in-python-with-pyglet\image-1.png)

Where the player sprites will float around in the direction they are pointing, until they crash into another sprite, causing both of them to disappear.

This is a quick intro to Pyglet, I am hoping to expand on this simulation and am positive I will be doing further write ups with it in the future.
