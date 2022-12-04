# Load balancing

A core feature of gridworld is scaling with minimal administration through automatic on demand server creation and configuration. One obvious issue of generating servers continuously is resource demand, and especially waste. This document describes how gridworld handles this problem.

## Shutting down unused servers

Servers are shut down when they have been unused for a certain amount of time. This time is configurable in the web interface and defaults to 30 minutes. The time is measured from the last time a player connected to the server, and the server is shut down when the time has passed.

Servers claimed by a faction stays online for 48 hours after the last player from the faction disconnected. This allows production to keep running while the players are offline, and also allows players to reconnect to the same server if they disconnect withoug having to go through the lobby.

## Load balancing active instances

While gridworld spreads newly created instances across available nodes, that is not enough to ensure even load. As servers are started and stopping by the algorithm and people build factories on some instances but not others, the load will become uneven. To solve this problem gridworld has a load balancing algorithm that determines instances in need of migration. Once the imbalance reaches a certain threshold servers with no players online will be migrated to a new slave.

## Algorithm

### Load factor

The load factor is an absolute value approximating how heavy the instance is. We calculate it by counting the number of entities of various types and multiplying by a constant for the type of entity.

| Entity type        | Load factor |
| ------------------ | ----------- |
| inserter           | 1           |
| transport-belt     | 0.01        |
| mining-drill       | 1           |
| furnace            | 1           |
| assembling-machine | 2           |
| lab                | 2           |
| train-stop         | 5           |
| pipe               | 0.1         |
| reactor            | 20          |

The table of weights is stored in `module/constants.lua`
