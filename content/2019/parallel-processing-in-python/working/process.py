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

