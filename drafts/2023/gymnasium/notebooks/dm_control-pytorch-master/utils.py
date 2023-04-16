import random
import collections
import yaml

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt


class ReplayMemory:
    def __init__(self, capacity):
        self.capacity = capacity
        self.memory = []
        self.position = 0

    def push(self, e):
        if len(self.memory) < self.capacity:
            self.memory.append(e)
        else:
            self.memory[self.position] = e
        self.position = (self.position + 1) % self.capacity

    def sample(self, batch_size):
        return random.sample(self.memory, batch_size)

    def __len__(self):
        return len(self.memory)


def load_yaml_configs(filename, model_name):
    with open(filename, 'r') as f:
        model_configs = yaml.safe_load(f)
    model_configs = model_configs[model_name]
    ModelConfigs = collections.namedtuple('ModelConfigs', model_configs.keys())
    for key, value in model_configs.items():
        try:
            if 'e' in value:
                model_configs[key] = float(value)
        except Exception:
            pass
    return ModelConfigs(*model_configs.values())


def enumerate(num_samples_per_dim, low, high):
    num_dim = len(low)
    assert num_samples_per_dim >= 2, 'Enumeration error. Number of samples per dimension is {}.'.format(num_samples_per_dim)
    assert num_dim > 0, 'Enumeration error. Number of dimension is {}.'.format(num_dim)

    cur_enums = [[low[0] + (high[0] - low[0]) * i / (num_samples_per_dim - 1)] for i in range(num_samples_per_dim)]

    for j in range(1, num_dim):
        new_enums = []
        enum_new_dim = [[low[j] + (high[j] - low[j]) * i / (num_samples_per_dim - 1)] for i in range(num_samples_per_dim)]
        for cur_enum in cur_enums:
            for new_element in enum_new_dim:
                new_enums.append(cur_enum + new_element)

        cur_enums = new_enums

    return cur_enums


def get_state(observation):
    state = []
    for s in observation.values():
        state += list(s)
    return state


def plot_figure(y, x=None, title=None, xlabel=None, ylabel=None, figure_num=None, display=True, save=False, filename=None):
    if figure_num is None:
        plt.figure()
    else:
        plt.figure(figure_num)

    plt.clf()

    if title is not None:
        plt.title(title)
    if xlabel is not None:
        plt.xlabel(xlabel)
    if ylabel is not None:
        plt.ylabel(ylabel)

    if x is not None:
        plt.plot(x, y)
    else:
        plt.plot(y)

    if save:
        plt.savefig(filename if filename is not None else 'figure.png')
    if display:
        print('here')
        plt.show()
