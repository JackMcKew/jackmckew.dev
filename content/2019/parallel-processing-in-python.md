Title: Parallel Processing in Python
Date: 2019-06-07 06:30
Author: Jack McKew
Tags: python
Slug: parallel-processing-in-python
Status: published

Parallel processing is a mode of operation where the task is executed simultaneously in multiple processors in the same computer. The purpose of this is intended to reduce the overall processing time, however, there is often overhead between communicating processes. For small tasks, the overhead is detrimental to the length of processing, increasing the overall time taken.

For this post we will be using the multiprocessing package in Python. Multiprocessing is apart of the standard library within Python and is a package that supports spawning processes using an API similar to the threading module (also apart of the standard library). The main benefit of the multiprocessing package, is that it disregards the global interpreter lock (GIL), by using sub processes instead of threads.

The number of processors or threads in your computer dictates the maximum number of processes you can run at a time. To add flexibility to your program when it may be run across multiple machines, it is good practice to make use of the cpu\_count() function apart of the multiprocessing, as shown below (please note f strings were only introduced in Python 3.6).

``` python
import multiprocessing as mp
print(f"Maximum number of processes: {mp.cpu_count()}")
```

In parallel processing, there are two types of execution: Synchronous and Asynchronous. Synchronous meaning where the processes are completed in the same order in which it was started, such that, the output is (normally) in order. While asynchronous means the processes can be in any order, and while the output can be mixed, is usually computed faster.

Within multiprocessing there are 2 main classes that you will use for parallel processing: Pool & Process. The two classes are intended to be used in completely different scenarios, but still utilize parallel processing. Pool is beneficial for when you have a long list that need to be processed and combined back together at the end. Process is beneficial for when you need multiple functions running simultaneously, albeit not the same.

### The Pool Class

The pool class has four methods that are particular useful:

-   Pool.apply
-   Pool.map
-   Pool.apply\_async
-   Pool.map\_async

Before we tackle the asynchronous variants of the pool methods (async suffix). Here is a simple example using Pool.apply and Pool.map. We initialize the number of processes to however many is available or the maximum of the system.

``` python
def power_n_minus_1(value):
    return value**value-1
if __name__ == '__main__':
    pool = mp.Pool(processes=mp.cpu_count())
    results = [pool.apply(power_n_minus_1,args=(x,)) for x in range(1,5)]
    print(results)
```

With the results being: \[1, 2, 9, 64\] or 1\^0, 2\^1,3\^2,4\^3. This can also be achieved similarly with Pool.map.

``` python
def power_n_minus_1(value):
    return value**value-1
if __name__ == '__main__':
    pool = mp.Pool(processes=mp.cpu_count())
    results = pool.map(power_n_minus_1,range(1,5))
    print(results)
```

Both of these will lock the main program that is calling them until all processes in the pool are finished, use this if you want to obtain results in a particular order. However if you don't care about the order and want to retrieve results as soon as they finished, then use the async variant.

``` python
def power_n_minus_1(value):
    return value**value-1
if __name__ == '__main__':
    pool = mp.Pool(processes=mp.cpu_count())
    outputs = [pool.apply_async(power_n_minus_1,args=(x,)) for x in range(1,5)]
    results = [p.get() for p in outputs]
    print(results)
```

### The Process Class

The process class is the most basic approach to parallel processing from multiprocessing package. Here we will use a simple queue function to generate 10 random numbers in parallel.

``` python
import multiprocessing as mp
import random

output = mp.Queue()

def rand_number(lower_limit,upper_limit,output):
    output.put(random.randint(lower_limit,upper_limit))

if __name__ == "__main__":
    processes = [mp.Process(target=rand_number,args=(1,101,output)) for x in range(10)]
    for p in processes:
        p.start()
    for p in processes:
        p.join()
    results = [output.get() for p in processes]
    print(results)
```

With the result being: \[76, 40, 76, 27, 64, 94, 30, 71, 70, 40\].

By utilizing the multiprocessing package in Python or parallel computing concepts in general, you will now be able to dramatically increase computation times (for large processes).
