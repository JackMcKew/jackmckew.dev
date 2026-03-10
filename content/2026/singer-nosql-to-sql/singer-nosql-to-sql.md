Title: Singer - Building Data Pipelines From NoSQL to SQL
Date: 2026-03-10
Author: Jack McKew
Category: Software
Tags: singer, etl, nosql, sql, data-pipeline

Data lives everywhere now. DynamoDB in production, MongoDB in legacy systems, Firestore in serverless projects. At some point you need all of it in one place - usually a SQL database where you can actually run analytics.

The obvious solution is custom code: connect to source, loop through data, transform, insert into target. Works great until your schema changes, your data grows 10x, or you need to handle this for 5 different sources. Then you're writing the same ETL boilerplate over and over.

Enter Singer. It's a spec for building data connectors. You write a "tap" (data source) and a "target" (data sink), they speak a simple line-delimited JSON protocol, and you can pipe data from any tap to any target. Dozens of open-source connectors exist already.

The spec is elegant in its simplicity. Your tap outputs three types of JSON lines:

```json
{"type": "SCHEMA", "stream": "users", "schema": {"properties": {"id": {"type": "string"}, "email": {"type": "string"}}}}
{"type": "RECORD", "stream": "users", "record": {"id": "user1", "email": "jack@example.com"}}
{"type": "STATE", "value": {"position": 1000}}
```

Schema tells the target what columns exist and their types. Record is actual data. State is bookkeeping - lets you resume from where you left off if the job fails.

Your target just reads these lines and does stuff with them. Super simple.

Let me build a practical example. I've got data in MongoDB that I want in PostgreSQL. First, a custom tap for MongoDB:

```python
#!/usr/bin/env python3
import json
import sys
import pymongo
import argparse

def emit_schema():
    schema = {
        "type": "SCHEMA",
        "stream": "users",
        "schema": {
            "properties": {
                "_id": {"type": "string"},
                "name": {"type": "string"},
                "email": {"type": "string"},
                "created_at": {"type": "string"}
            }
        }
    }
    print(json.dumps(schema))

def emit_records(client, resume_token=None):
    db = client['mydb']
    collection = db['users']

    query = {}
    if resume_token:
        query = {"_id": {"$gt": resume_token}}

    for doc in collection.find(query).sort("_id", 1):
        record = {
            "type": "RECORD",
            "stream": "users",
            "record": {
                "_id": str(doc['_id']),
                "name": doc.get('name'),
                "email": doc.get('email'),
                "created_at": str(doc.get('created_at'))
            }
        }
        print(json.dumps(record))

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--config', required=True)
    parser.add_argument('--state', required=False)
    args = parser.parse_args()

    with open(args.config) as f:
        config = json.load(f)

    client = pymongo.MongoClient(config['connection_string'])

    resume_token = None
    if args.state:
        with open(args.state) as f:
            state = json.load(f)
            resume_token = state.get('position')

    emit_schema()
    emit_records(client, resume_token)

    # Emit final state
    state = {"type": "STATE", "value": {"position": "done"}}
    print(json.dumps(state))

if __name__ == '__main__':
    main()
```

Config file:

```json
{
    "connection_string": "mongodb://localhost:27017/",
    "database": "mydb",
    "collection": "users"
}
```

Now a simple target that writes to PostgreSQL:

```python
#!/usr/bin/env python3
import json
import sys
import psycopg2
import argparse

class PostgresTarget:
    def __init__(self, connection_string):
        self.conn = psycopg2.connect(connection_string)
        self.cursor = self.conn.cursor()
        self.current_stream = None

    def handle_schema(self, msg):
        self.current_stream = msg['stream']
        props = msg['schema']['properties']
        columns = ', '.join([f"{k} VARCHAR" for k in props.keys()])

        # Danger: SQL injection, don't do this in production
        create_sql = f"CREATE TABLE IF NOT EXISTS {self.current_stream} ({columns})"
        self.cursor.execute(create_sql)
        self.conn.commit()

    def handle_record(self, msg):
        stream = msg['stream']
        record = msg['record']

        cols = list(record.keys())
        vals = list(record.values())
        placeholders = ', '.join(['%s'] * len(vals))
        col_str = ', '.join(cols)

        insert_sql = f"INSERT INTO {stream} ({col_str}) VALUES ({placeholders})"
        self.cursor.execute(insert_sql, vals)
        self.conn.commit()

    def handle_state(self, msg):
        # In production, save this state somewhere
        pass

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--config', required=True)
    args = parser.parse_args()

    with open(args.config) as f:
        config = json.load(f)

    target = PostgresTarget(config['connection_string'])

    for line in sys.stdin:
        msg = json.loads(line)
        msg_type = msg.get('type')

        if msg_type == 'SCHEMA':
            target.handle_schema(msg)
        elif msg_type == 'RECORD':
            target.handle_record(msg)
        elif msg_type == 'STATE':
            target.handle_state(msg)

if __name__ == '__main__':
    main()
```

Wire them together:

```bash
./tap_mongodb.py --config mongo-config.json --state state.json | ./target_postgres.py --config postgres-config.json
```

Data flows from MongoDB to PostgreSQL. That's the whole thing.

Here's what makes Singer cool: you can swap either end. Want to go from MongoDB to BigQuery? Use the Singer BigQuery target instead. Want a different MongoDB source with different logic? Write a new tap. They all speak the same protocol.

The real Singer ecosystem has dozens of taps and targets already built. Google Sheets, Stripe, HubSpot on the tap side. Postgres, Redshift, Snowflake on the target side. If your source and target are both covered, you don't write any code - just configure and run.

But here's where it gets fiddly. The spec is simple, but implementations vary. Some taps support incremental sync (just new data since last run), others are full refresh every time. Some targets support schema evolution (new columns appearing), others don't. You end up reading documentation for each connector and hoping they work together.

The discovery mode is clever - taps can output all available streams (tables):

```bash
./tap_mongodb.py --config config.json --discover
```

This outputs schema for everything available, so the target can decide what to ingest. Beats manual config.

But operational experience is rough. Error handling is minimal - if something breaks mid-pipeline, you're reading stdout to figure out where. Logging is chaotic. State management is your problem (you decide where to save it). A production pipeline needs significant wrapper code.

I've used Singer for small data migrations and it's solid. Goes from "this will take a day to write" to "this took 2 hours". But it's not a data warehouse platform. It's a spec that lets you glue things together quickly. If you need a production data pipeline that runs daily, scales to billions of rows, has schema versioning and monitoring, you want Airflow or dbt or something more serious.

Singer shines for "I need to copy data from X to Y and do it reliably". Once works great. Twice is good. Ten times? You want actual tooling.

The honest take: Singer is elegant in theory, pragmatic in practice. The spec is genuinely good - line-delimited JSON is the right choice. The ecosystem is useful but incomplete. For one-off migrations it's excellent. For ongoing pipelines, it's the foundation but you'll wrap it in something else pretty quickly.

If you've got data in a NoSQL system and you need it in SQL, Singer is the fastest path from "this is annoying" to "data is there". Just accept that it's not a long-term solution - more of a really good duct tape.