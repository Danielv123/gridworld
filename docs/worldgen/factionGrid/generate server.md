# Generate server

The server generation is a multi-step process executed by the controller. It is expected to run frequently while players are using the cluster so reliability and speed is important.

The server generation function takes care of the following:

1. Create a new instance
2. Assign to a host with free capacity
3. Create a new save
4. Apply gridworld configuration options
5. Apply universal edges configuration
6. Start the server
7. Run world border creation scripts

## Gridworld configuration options

The following settings are set on the instance:

| Setting                     | Description                             |
| --------------------------- | --------------------------------------- |
| `gridworld.grid_id`         | The grid ID                             |
| `gridworld.grid_x_position` | The x position of the grid in the world |
| `gridworld.grid_y_position` | The y position of the grid in the world |
| `gridworld.grid_x_size`     | The x size of the grid in the world     |
| `gridworld.grid_y_size`     | The y size of the grid in the world     |

## Universal edges configuration

As of version 0.6 gridworld uses [universal_edges](https://github.com/Danielv123/universal_edges) instead of [edge_transports](https://github.com/clusterio/edge_transports). Universal edges is a typescript rewrite that uses a new configuration system and has support for more connector types (fluids, power, trains).

Edges allow for setting up connectors to transport items/fluids/power/trains between servers. They are automatically configured during server creation. Edges can be inspected/modified using the universal_edges web UI. There are a few peculiarities to how edges are set up with gridworld:

1. Edge IDs are not random, but based on the grid square the edge connects. `edge_${from}_${to}` where `from` and `to` are x,y coordinates.
2. At least during initial develpment, edges are refreshed on each instance start. This reduces the need for migrations, but means manual changes to the edge config can be unstable.
3. Unlike the old edge transports integration, gridworld no longer overwrites edges it did not create. This allows for custom topologies.
