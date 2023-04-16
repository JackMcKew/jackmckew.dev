import argparse
import os

import agents
import gym
import gym.spaces
import numpy as np
import tensorflow as tf
from dm_control import suite  # Must be imported after TensorFlow.


class DeepMindWrapper(object):
  """Wraps a DM Control environment into a Gym interface."""

  metadata = {'render.modes': ['rgb_array']}
  reward_range = (-np.inf, np.inf)

  def __init__(self, env, render_size=(64, 64), camera_id=0):
    self._env = env
    self._render_size = render_size
    self._camera_id = camera_id

  def __getattr__(self, name):
    return getattr(self._env, name)

  @property
  def observation_space(self):
    components = {}
    for key, value in self._env.observation_spec().items():
      components[key] = gym.spaces.Box(-np.inf, np.inf, value.shape)
    return gym.spaces.Dict(components)

  @property
  def action_space(self):
    action_spec = self._env.action_spec()
    return gym.spaces.Box(action_spec.minimum, action_spec.maximum)

  def step(self, action):
    time_step = self._env.step(action)
    obs = dict(time_step.observation)
    reward = time_step.reward or 0
    done = time_step.last()
    info = {'discount': time_step.discount}
    return obs, reward, done, info

  def reset(self):
    time_step = self._env.reset()
    return dict(time_step.observation)

  def render(self, mode='rgb_array', *args, **kwargs):
    if mode != 'rgb_array':
      raise ValueError("Only render mode 'rgb_array' is supported.")
    del args  # Unused.
    del kwargs  # Unused.
    return self._env.physics.render(
        *self._render_size, camera_id=self._camera_id)


class SelectKeysWrapper(object):
  """Select observations from a dict space and concatenate them."""

  def __init__(self, env, keys):
    self._env = env
    self._keys = keys

  def __getattr__(self, name):
    return getattr(self._env, name)

  @property
  def observation_space(self):
    components = self._env.observation_space.spaces
    components = [components[key] for key in self._keys]
    low = np.concatenate([component.low for component in components], 0)
    high = np.concatenate([component.high for component in components], 0)
    return gym.spaces.Box(low, high)

  def step(self, action):
    obs, reward, done, info = self._env.step(action)
    obs = self._select_keys(obs)
    return obs, reward, done, info

  def reset(self):
    obs = self._env.reset()
    obs = self._select_keys(obs)
    return obs

  def _select_keys(self, obs):
    return np.concatenate([obs[key] for key in self._keys], 0)


def create_env():
  env = suite.load('reacher', 'easy')
  env = DeepMindWrapper(env)
  env = SelectKeysWrapper(env, ['position', 'velocity', 'to_target'])
  return env


def reacher():
  locals().update(agents.scripts.configs.default())
  env = create_env
  max_length = 1000
  steps = 1e7  # 10M
  discount = 0.985
  update_every = 60
  return locals()


def main(args):
  agents.scripts.utility.set_up_logging()
  logdir = args.logdir and os.path.expanduser(args.logdir)
  if args.mode == 'train':
    try:
      # Try to resume training from log directory.
      config = agents.scripts.utility.load_config(args.logdir)
    except IOError:
      # If no config was found in the logdir, start new training run.
      config = agents.tools.AttrDict(globals()[args.config]())
      config = agents.scripts.utility.save_config(config, logdir)
    for score in agents.scripts.train.train(config, env_processes=True):
      tf.logging.info('Score {}.'.format(score))
  if args.mode == 'render':
    agents.scripts.visualize.visualize(
        logdir=args.logdir, outdir=args.logdir, num_agents=1, num_episodes=5,
        checkpoint=None, env_processes=True)


if __name__ == '__main__':
  parser = argparse.ArgumentParser()
  parser.add_argument('--mode', choices=['train', 'render'], default='train')
  parser.add_argument('--logdir', default='~/logdir/varagent')
  parser.add_argument('--config')
  args = parser.parse_args()
  main(args)