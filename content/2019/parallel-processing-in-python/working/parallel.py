import multiprocessing as mp
import numpy as np
print(f"Maximum number of processes: {mp.cpu_count()}")

def power_n_minus_1(value):
    power = value-1
    return value**power

if __name__ == '__main__':
    pool = mp.Pool(processes=mp.cpu_count())
    # results = [pool.apply(power_n_minus_1,args=(x,)) for x in range(1,5)]
    # results = pool.map(power_n_minus_1,range(1,5))
    outputs = [pool.apply_async(power_n_minus_1,args=(x,)) for x in range(1,5)]
    results = [p.get() for p in outputs]
    print(results)