# Factions - force handling

Traditionally, non-cooperative multiplayer in factorio has been done using the built in `forces` system. Forces have a few problems though:

- They are not synchronized between servers. We would have to add logic for that
- There is a limit of 64 forces. This is not enough for a large server. The reason for this is that each entity has to store which force it belongs to. This is done with a 6 bit integer.

## How do we handle forces?

We handle all user management through our own factions code. Forces are used for access control of entities on claimed servers. Rather than creating one force for each faction, we instead only create a force if your faction has a claim on the current server. People from factions without a claim on the current server will be left in the default force.

| force index | force name | usage                                                           |
| ----------- | ---------- | --------------------------------------------------------------- |
| 1           | neutral    | unused                                                          |
| 2           | player     | default force for players without a claim on the current server |
| 3           | enemy      | default force for enemies                                       |
| 4           | faction 1  | force for faction 1                                             |

## What do we do when a force looses its claim to its area?

When a faction looses its claim to an area, we will move all players from that faction to the default force. We will also move all entities from that faction to the default force. This will prevent them from being automatically seized by the next faction claiming the area.
