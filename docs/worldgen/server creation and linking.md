# Worldgen - server creation and linking

This page describes the internal workings of the server creation and linking system. It is not intended for end users. For an overview of server generation, see [generate server](factionGrid/generate%20server.md).

## Messages

|                Message                |      Link       | Description                                                                                                    |
| :-----------------------------------: | :-------------: | :------------------------------------------------------------------------------------------------------------- |
|    `ipc-gridworld:join_gridworld`     | module-instance | Join gridworld in last location                                                                                |
|      `gridworld:join_gridworld`       | instance-master | Forward message to master to determine join location, respond with connection details after server is prepared |
|     `gridworld:sync_faction_data`     | master-instance | Forward message to instance to sync faction data                                                               |
| `gridworld:sync_player_data_for_join` | master-instance | Sync player data to the instance and open the server for a specific player connecting                          |
|      `/sc gridworld.join_server`      | instance-module | Prompt for server connection                                                                                   |

### Instance join_gridworld IPC handler

Forward request to master using gridworld:join_gridworld message. Once we get the connection details in the response from the master we use `/sc gridworld.join_server()` to prompt the user to connect to the prepared server.

### Master join_gridworld request handler

Get current player location in gridworld by looking up the player profile. If the player does not have a disconnect location, use the default spawn point for the faction.

Look up the server using the player location. If the server doesn't exist, generate it using `src/worldgen/factionGrid/createServer`. If its stopped, start it.

Once its started, we send data about the connecting player to the instance:

1. `gridworld:sync_faction_data`
2. `gridworld:sync_player_data_for_join`

Once the instance is ready, we respond to the request with the connection details.
