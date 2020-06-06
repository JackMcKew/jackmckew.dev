import ppb


class Player(ppb.BaseSprite):
    pass


def setup(scene):
    scene.add(Player())


ppb.run(setup=setup)
