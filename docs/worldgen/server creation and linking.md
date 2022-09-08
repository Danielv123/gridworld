# Worldgen - server creation and linking

When creating a new gridworld, only a lobby server is generated. The game worlds are generated on demand as players move around the world. This is a central part of the gridworld faction scenario.

## Event flow (user perspective)

An user joins the gridworld lobby and creates a new faction, then joins the game.
Pressing the join game button sends a message to the master. It tries to determine the spawn point for the user. If the user hasn't spawned in before it will use the default spawn point of the faction. If the user has spawned in before it will use the last known spawn point.

The spawn point is in absolute coordinates. This is translated to server coordinates using the grid settings of the cluster with a utility function. If the resulting server doesn't exist already it is generated, then the user is prompted to join it using the join_server API.
Walking to the edge of any server prompts a similar process, except if the server isn't already generated the user will be prompted first.

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
