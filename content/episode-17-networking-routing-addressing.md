Title: Episode 17 – Networking Routing & Addressing
Date: 2019-03-15 06:30
Author: admin
Category: Code Fridays
Tags: Code Fridays
Slug: episode-17-networking-routing-addressing
Status: published

<!-- wp:paragraph -->

Following last weeks post around network topologies, I believe the next topic to cover is routing and addressing. Routing is the process of selecting a path for traffic to flow through in a network while addressing is marking elements within a network. A real-world example of routing and addressing is the postal system, each element (person) is marked with an address (eg, a street address) and the mail makes it to that address from routing it from the sender to the receiver.

<!-- /wp:paragraph -->

<!-- wp:paragraph -->

While the goal for routing may be simple (“go from sender to receiver in the most efficient/quickest way possible”), the techniques used to achieve this can be very complex and confusing but when solutions are found that make a network work efficiently, it is a very rewarding experience for all users.

<!-- /wp:paragraph -->

<!-- wp:paragraph -->

Routing can be broken into three broad categories:

<!-- /wp:paragraph -->

<!-- wp:list -->

-   Protocols – the medium that allows information to move through a network
-   Algorithms – to determine paths between sender and receiver
-   Databases – to store information that the algorithms determine

<!-- /wp:list -->

<!-- wp:paragraph -->

The whole premise around routers in a network ([Networking Basics](https://jmckew.com/2019/03/08/episode-16-networking-basics/)) is that they will “pass it on”, either to their smarter peers or in the correct direction. For example in a star/tree network, devices pass information to their closest ‘router’ which then decides either to pass it directly to the correct address or to another router which may have a better idea on where the information is intended on going.

<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->

### Protocols

<!-- /wp:heading -->

<!-- wp:paragraph -->

In industry,\
some of the most common networking protocols are MODBUS and DNP3. Modbus being\
a de-facto standard for interconnecting electrical equipment and DNP3\
(Distributed Network Protocol) commonly being used in the water/electric industries\
for their flexibility during outages or broken links in a network.

<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->

### Algorithms

<!-- /wp:heading -->

<!-- wp:paragraph -->

Routing\
tables is the most prevalent type of routing algorithms with their fixed nature\
meaning once the routing decisions for how information travels have been decided,\
they do not change. The other type of routing algorithms (which are much more\
exciting) are known as adaptive algorithms, which means the routing changes\
depending on: topology, delay, load, etc, to try and reach the most efficient path\
from sender to receiver.

<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->

### Databases

<!-- /wp:heading -->

<!-- wp:paragraph -->

Following\
algorithms, databases can either hold the entire routing table and a router\
looks up where it wants to go and it which path to take (similar to a bus\
timetable), or, forwarding tables (technically can be apart of routing tables\
as well) which detail the communications pathways to utilize for types of\
traffic.

<!-- /wp:paragraph -->
