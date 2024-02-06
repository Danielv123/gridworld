# Generate server

The server generation is a multi-step process executed by the controller. It is expected to run frequently while players are using the cluster so reliability and speed is important.

The server generation function takes care of the following:

1. Create a new instance
2. Assign to a host with free capacity
3. Create a new save
4. Apply gridworld configuration options
5. Apply edge transports configuration
6. Apply edge transports configuration to neighboring servers
7. Start the server
8. Run world border creation scripts

## Gridworld configuration options

The following settings are set on the instance:

| Setting                     | Description                             |
| --------------------------- | --------------------------------------- |
| `gridworld.grid_id`         | The grid ID                             |
| `gridworld.grid_x_position` | The x position of the grid in the world |
| `gridworld.grid_y_position` | The y position of the grid in the world |
| `gridworld.grid_x_size`     | The x size of the grid in the world     |
| `gridworld.grid_y_size`     | The y size of the grid in the world     |

## Edge transports configuration

The following settings are set on the instance:

| Setting                    | Description                   |
| -------------------------- | ----------------------------- |
| `edge_transports.internal` | Edge transports configuration |

The edge transports configuration is an object like `{edges: []}`. Each edge has the following properties:

| Property          | Description                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| `id`              | edge ID                                                                                         |
| `origin`          | [x,y]                                                                                           |
| `surface`         | Target surface index, always 1 for gridworld                                                    |
| `direction`       | Factorio cardinal direction index. The border is drawn as a beam with the IO on the right side. |
| `length`          | Length of border                                                                                |
| `target_instance` | Instance ID of target server                                                                    |
| `target_edge`     | Corresponding edge ID on the target server                                                      |
