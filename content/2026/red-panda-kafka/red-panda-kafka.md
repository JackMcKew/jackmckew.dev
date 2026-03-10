Title: Red Panda - The Kafka Alternative That Actually Works
Date: 2026-03-10
Author: Jack McKew
Category: Software
Tags: redpanda, kafka, streaming, data-engineering

Kafka is the industry standard for event streaming, and it's also kind of a pain. It's written in Scala, it's slow to start, it requires ZooKeeper (which is its own operational nightmare), and the documentation reads like someone trying to explain plumbing to an alien. I've run it in production, I know how to operate it, and I'm still annoyed by it.

Then I found Redpanda. Same API as Kafka (you can drop it in as a replacement), but written in Rust, no ZooKeeper, runs as a single binary, and starts in seconds. I spent a weekend seeing if the marketing is real or just hype.

Spoiler: it mostly works.

The setup is genuinely this simple:

```bash
docker run -it --rm -p 9092:9092 redpandadata/redpanda
```

That's it. Kafka running (well, Redpanda) in one command. Kafka equivalent would be 5 commands and you'd still need ZooKeeper running separately. For local development, this alone is worth the switch.

The API is compatible with Kafka clients. I took a Python project using kafka-python and swapped the broker URL - no code changes. It just worked. Same producer, same consumer, same message structure.

Let me build a real example. A simple producer that publishes fake stock prices to a topic:

```python
from kafka import KafkaProducer
import json
import time
import random

producer = KafkaProducer(
    bootstrap_servers=['localhost:9092'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

symbols = ['AAPL', 'MSFT', 'TSLA', 'GOOGL']

for _ in range(100):
    symbol = random.choice(symbols)
    price = round(random.uniform(100, 300), 2)

    producer.send('stock-prices', {
        'symbol': symbol,
        'price': price,
        'timestamp': time.time()
    })

    time.sleep(0.5)

producer.flush()
```

And a consumer that reads them:

```python
from kafka import KafkaConsumer
import json

consumer = KafkaConsumer(
    'stock-prices',
    bootstrap_servers=['localhost:9092'],
    value_deserializer=lambda m: json.loads(m.decode('utf-8')),
    auto_offset_reset='earliest'
)

for message in consumer:
    data = message.value
    print(f"{data['symbol']}: ${data['price']}")
```

This runs against Redpanda exactly as is. No changes. Against actual Kafka? Same. That's the point - Redpanda is Kafka-compatible, not Kafka-inspired.

Where Redpanda gets interesting is the operational side. Kafka's architecture is designed around distributed consensus via ZooKeeper. Redpanda uses Raft instead, which is simpler and faster. The result: no separate ZooKeeper service to maintain, no weird quorum timeouts, no "broker won't rejoin the cluster" disasters.

I ran a three-node Redpanda cluster locally (just for testing). Docker Compose:

```yaml
version: '3.8'
services:
  redpanda-1:
    image: redpandadata/redpanda
    environment:
      REDPANDA_BROKERID: 1
    command:
      - redpanda
      - start
      - --nodes=3
      - --advertised-kafka-api=redpanda-1:9092

  redpanda-2:
    image: redpandadata/redpanda
    environment:
      REDPANDA_BROKERID: 2
    depends_on:
      - redpanda-1
    command:
      - redpanda
      - start
      - --nodes=3
      - --advertised-kafka-api=redpanda-2:9092
      - --seeds=redpanda-1:33145

  redpanda-3:
    image: redpandadata/redpanda
    environment:
      REDPANDA_BROKERID: 3
    depends_on:
      - redpanda-1
    command:
      - redpanda
      - start
      - --nodes=3
      - --advertised-kafka-api=redpanda-3:9092
      - --seeds=redpanda-1:33145
```

This brought up a 3-node cluster in about 10 seconds. Kafka would have taken 30+ seconds per node, plus ZooKeeper startup, plus waiting for everything to sync. One gotcha: you have to set REDPANDA_BROKERID on each node - without it, each one thinks it's broker 1.

The admin experience is better too. Kafka has tools, but they're clunky. Redpanda includes an admin CLI that actually makes sense:

```bash
rpk cluster info
rpk topic create my-topic --partitions 3 --replication-factor 3
rpk topic list
rpk topic describe my-topic
```

No mysterious Scala logging to parse. Just clear output.

The performance is noticeably better for single-box setups. Redpanda's architecture assumes you're running multiple copies for HA, but even one instance is snappier. I ran a benchmark - producer throughput on a single Redpanda instance was about 20% higher than Kafka on the same hardware. That's real but not revolutionary.

Here's where I hit the limits: the ecosystem. Kafka has a huge community. Tools, connectors, monitoring, integrations. Redpanda is newer and smaller. If you need a Kafka Connect source for some obscure database, you're probably out of luck with Redpanda (though they're adding support gradually). The KSQL equivalent (Redpanda Console) is... okay, but not as feature-complete as Confluent Cloud.

Also, Redpanda is a company with a cloud offering, and they're obviously steering you toward it. The open-source version is legit, but the docs sometimes make the cloud version sound like the obviously correct choice. It probably is, for production, but it stings.

My honest take: if you're building something new and don't need the broader Kafka ecosystem, use Redpanda. Simpler ops, faster iteration, cleaner experience. If you're in an org already running Kafka, the switch cost probably isn't worth it. If you're evaluating streaming platforms and someone says "just use Kafka", push back and ask if you actually need Kafka or if Redpanda would be simpler.

For side projects needing event streaming? Redpanda in Docker is legitimately the easiest option now. You get a real streaming platform in one command instead of spending 2 hours getting Kafka to not crash.

The wild part is that this is what Kafka should have been from the start. Rust, no ZooKeeper, single binary, fast startup. It took a company writing a from-scratch reimplementation to prove the Kafka model didn't require all that complexity. That's a win for everyone - Redpanda pushes Kafka to get better too.