Title: Pandarallel - Making Pandas apply() Actually Fast
Date: 2026-03-10
Author: Jack McKew
Category: Python
Tags: pandas, pandarallel, parallel-processing, performance

Pandas is great until you call `apply()` on a large DataFrame and watch your CPU spin at 25% while the rest of your machine sits idle. Then you remember that Python's got a GIL, your 8-core processor is actually 1-core, and the whole thing is painful.

I run into this constantly. Data pipeline, transformation loop, nothing crazy. But `apply()` is the Pandas way and the Pandas way is slow.

Enter Pandarallel. It's a tiny library that makes `apply()` use all your cores. Not async, not some hacky workaround - actual multiprocessing. And it takes like two minutes to add to your code.

Here's the problem, visualized. Say you've got a DataFrame of 10,000 rows and you need to parse timestamps from a weird string format:

```python
import pandas as pd
import time

df = pd.DataFrame({
    'id': range(10000),
    'timestamp_str': ['2026-03-10T14:30:00'] * 10000,
    'value': range(10000)
})

def parse_timestamp(row):
    # Simulate some actual work
    ts = pd.Timestamp(row['timestamp_str'])
    time.sleep(0.0001)  # Fake processing
    return ts.year

start = time.time()
df['year'] = df.apply(parse_timestamp, axis=1)
print(f"apply() time: {time.time() - start:.2f}s")
```

On my machine, this takes about 1.2 seconds. Not terrible, but your CPU is at 25% because it's single-threaded. Now swap in Pandarallel:

```python
from pandarallel import pandarallel

pandarallel.initialize(nb_workers=4, progress_bar=True)

start = time.time()
df['year'] = df.parallel_apply(parse_timestamp, axis=1)
print(f"parallel_apply() time: {time.time() - start:.2f}s")
```

Same code, one extra call to `initialize()`, swap `apply()` for `parallel_apply()`. Runtime drops to about 0.35 seconds. 3-4x faster on a 4-core machine.

The install is trivial:

```bash
pip install pandarallel
```

And that's it. No config, no magic. Just works.

How it actually works: Pandarallel splits your DataFrame into N chunks (where N is the number of workers), ships each chunk to a separate process, applies your function, collects the results back. Because they're separate processes, they sidestep the GIL. Real parallelism.

The gotcha is that your function has to be serializable. Any lambda works fine, any regular function works fine. But if you're applying a method from inside an object that has non-serializable attributes, you'll hit pickling errors. Usually not a problem in practice.

Let me build a more realistic example. Say you're processing user data and need to extract signal from a messy text field:

```python
import pandas as pd
from pandarallel import pandarallel
import re

pandarallel.initialize(nb_workers=4, verbose=0)

df = pd.DataFrame({
    'user_id': range(5000),
    'feedback': [
        'great product, would use again!',
        'not bad, slow sometimes',
        'absolute garbage, do not recommend',
    ] * 1666 + ['meh'] * 2
})

def extract_sentiment_words(row):
    """Extract capitalized words (assumed to be emphasis)"""
    text = row['feedback'].upper()
    words = re.findall(r'\b[A-Z]+\b', text)
    return len(words)

df['emphasis_count'] = df.parallel_apply(extract_sentiment_words, axis=1)
print(df.head())
```

With a real function (not the fake sleep), this is where the speedup matters. You've got 5000 rows, each one does regex work, probably takes 0.1-0.5ms. Single-threaded = 500ms-2500ms. Four workers = 150ms-650ms.

Windows support is... a thing. Pandarallel needs to use multiprocessing, which on Windows has some quirks around how subprocesses are started. It works if your code is in a `if __name__ == '__main__':` block, but I've had flaky behavior. On Linux and macOS it's rock solid. Windows feels like a second-class citizen - not broken, just requires extra care.

Progress bars are built in, which is honestly nice for long-running operations:

```python
# Enable progress bars at initialization time
pandarallel.initialize(nb_workers=4, progress_bar=True)

# Now any parallel_apply call will show a per-worker progress bar
df['processed'] = df.parallel_apply(your_function, axis=1)
```

You can disable them with `progress_bar=False` (the default), or pass `verbose=0` to suppress the startup message.

Memory usage goes up linearly with worker count - you're copying the relevant columns to each worker process, so a 100MB DataFrame with 4 workers means roughly 400MB usage at peak. Not a deal-breaker but worth knowing.

One other gotcha: if your function is slow or does I/O (network requests, file reads), Pandarallel isn't magic. The speedup is from parallelism, which only helps if your function is CPU-bound. If you're making HTTP requests in your apply function, 4 workers might not even speed things up (or could be slower due to overhead). For that, use something like `concurrent.futures` or Dask.

I've had Pandarallel handle everything from data cleaning to feature engineering to complex transformations. As long as it's CPU-bound and your function is pure-ish (no weird global state), it works great.

The honest thing: this is such a simple library that I'm surprised it doesn't get more attention. It solves one problem (slow apply) in one elegant way (multiprocessing with no fuss) and ships it. No frameworks, no learning curve, just swap `apply()` for `parallel_apply()` and be done.

For my data pipelines, Pandarallel cut 20-30% off runtime in places where I was CPU-bound. Not as dramatic as rewriting the whole pipeline, but way better than nothing and took like 2 minutes to add.

If you've got a Pandas operation that's obviously bottlenecked and you're staring at 25% CPU usage, try Pandarallel first. Might solve your problem in literally one line.

![Benchmark: apply() vs parallel_apply() across worker counts]({static}images/benchmark.png)