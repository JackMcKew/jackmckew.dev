Title: DuckDB: SQL Analytical Queries Without a Server
Date: 2026-03-11
Author: Jack McKew
Category: Python
Tags: python, duckdb, sql, data-analysis, parquet, performance

I stumbled into DuckDB last month while frustrated with pandas groupby being slow on a 2GB CSV, and it's genuinely changed how I explore data. The hook: it's a full analytical SQL engine that runs entirely in-process - no server, no Docker, no setup. Just spin it up and query.

Here's the thing that got me - you can query Parquet files directly without loading them into memory. Want to join a CSV to an S3 Parquet file? Yeah, that works. Window functions? Aggregates? CTEs? All there. It's basically DuckDB asking "what if we made PostgreSQL but for laptops?"

Let me show you the basics:

```python
import duckdb

conn = duckdb.connect(':memory:')
result = conn.execute("SELECT 1 as number").fetchall()
print(result)
```

That's it. You've got a SQL engine. Now the useful part - reading files:

```python
# Query a CSV directly
result = conn.execute("SELECT * FROM 'data.csv' WHERE age > 30 LIMIT 5").fetchall()

# Or Parquet
result = conn.execute("SELECT COUNT(*) FROM 'data.parquet'").fetchall()

# Join them
result = conn.execute("""
  SELECT a.id, a.name, b.score
  FROM 'users.csv' a
  LEFT JOIN 'scores.parquet' b ON a.id = b.user_id
  WHERE b.score > 80
""").fetchall()
```

No loading. No temporary tables. Just query.

I built a quick benchmark comparing DuckDB to pandas on a 500MB CSV with 5 million rows - simple groupby aggregation (sum, count, mean by category). DuckDB did it in 1.2 seconds. Pandas took 8 seconds. And pandas melted my RAM spiking to 2GB while DuckDB sat at 150MB. I was expecting it to be "pretty good" but that gap surprised me.

The window functions are where things get genuinely powerful. Here's a running total:

```python
conn.execute("""
  SELECT
    date,
    amount,
    SUM(amount) OVER (ORDER BY date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as running_total
  FROM transactions
  ORDER BY date
""").to_df()
```

And you can do the classical analytical stuff - rank, row_number, lag/lead. All the things you'd reach for PostgreSQL for:

```python
SELECT
  user_id,
  date,
  revenue,
  LAG(revenue) OVER (PARTITION BY user_id ORDER BY date) as prev_month,
  (revenue - LAG(revenue) OVER (PARTITION BY user_id ORDER BY date)) * 100.0 / LAG(revenue) OVER (PARTITION BY user_id ORDER BY date) as pct_change
FROM monthly_stats
ORDER BY user_id, date
```

Now the honest bit - it's not a replacement for production databases. You don't get ACID transactions, concurrent writes are single-threaded, and persistence is... well, you manage it. But for analysis work? For exploring data on your laptop? For building data tools that need to run locally? It's exactly right.

One gotcha I hit: DuckDB uses a different type system than pandas. Nulls are handled differently, timestamps need `CAST`, and if you're mixing types in operations you'll get errors rather than silent conversions (which is actually better but catches you off guard). Also, some packages aren't available yet - you can't just `pip install` a random SQL extension the way you can with plugins for other databases.

The S3 querying is real though. With credentials set:

```python
result = conn.execute("""
  SELECT * FROM read_parquet('s3://my-bucket/data/*.parquet')
  WHERE year = 2026
""").to_df()
```

No downloading. Stream from S3, filter, return.

I've started keeping a DuckDB database as the source-of-truth for analysis projects instead of CSV dumps. It's faster to query, joins are cleaner to express, and it teaches you to think in SQL rather than pandas transformations (which is good - SQL is more portable).

If you do any data work and haven't tried it, spend 20 minutes on the docs. The ergonomics are absurdly good.
