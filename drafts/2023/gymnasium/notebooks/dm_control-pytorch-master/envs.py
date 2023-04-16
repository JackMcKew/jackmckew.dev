import numpy as np
from dm_control import suite

def create_env(domain, task=None, verbose=False):
    if task is not None:
        assert (domain, task) in suite.BENCHMARKING, 'Cannot find domain {} task {}.'.format(domain, task)
        if verbose:
            print('Loading environment: domain {} task {}.'.format(domain, task))
        return suite.load(domain, task)

    domains = np.array([d for (d, t) in suite.BENCHMARKING])
    assert domain in domains, 'Cannot find domain {} task {}.'.format(domain, task)
    i = np.where(domains == domain)[0][0]
    d, t = suite.BENCHMARKING[i]
    if verbose:
        print('Loading environment: domain {} task {}.'.format(d, t))
    return suite.load(d, t)