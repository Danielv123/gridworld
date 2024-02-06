# Worldgen overview

When creating a new gridworld, only a lobby server is generated. The game worlds are generated on demand as players move around the cluster. This is a central part of the gridworld faction scenario.

## Event flow (user perspective)

An user joins the gridworld lobby and creates a new faction, then joins the game.
Pressing the join game button sends a message to the controller. It tries to determine the spawn point for the user.

1. If the user has spawned in before it will use the last known spawn point.
1. If the user hasn't spawned in before it will use the default spawn point of the faction.
1. If the user isn't part of a faction we will send them to the world spawn

The spawn point is in absolute coordinates. This is translated to server coordinates using the grid settings of the cluster with a utility function. If the resulting server doesn't exist already it is generated, then the user is prompted to join it using the join_server API. The user can quickly accept the teleport prompt by pressing the E key.

Walking to the edge of any server prompts a similar process, except if the server isn't already generated the user will be prompted first.
When teleporting from the edge of one server to the next the player position is adjusted to be on the corresponding edge of the new server.

For a more technical rundown of the internal communications flow used to allow this to work, see the [server creation and linking](server%20creation%20and%20linking.md) page.
