# Gridworld train support

The old clusterio 1.2 had a plugin for cross server trains. It had a few major issues:

* Trains kept dissappearing
* It kept crashing servers
* Very few people understood how to set up and diagnose the train schedules

There are multiple reasons why we ended up with those issues. A few points I'd like to avoid in this new implementation:

* No magic hotpatch runtime loading
* No custom multi server schedule user interface/logic, use vanilla schedules and let players work it out
* No multiple to multiple stations - only one to one based on same world coordinate, even if they have the same name
* Don't allow manual placement in destination station area. Instead, the origin station is placed inside the world border, and once valid is automatically replicated outside of the world border on the destination server.

## User flow

Place a straight rail facing into the world border. Place a train stop on the right hand side of the rail as close to the border as possible. Place a train signal further down the station where you want the train to end. This denotes the max train size.

The train stop will be the origin station. The train stop will be replicated on the destination server, placed outside the world border facing in. The train stop will have the same world coordinates as the origin station. The station name of the destination station does not matter. The station name of the origin station only matters as far as local train schedules are concerned.

To make a train travel between servers consider the following setup.

Southern server:
- Normal station: "Iron mine"
- Origin station, facing border: "North"
- Destination station, facing the border from the outside: "South"

Northern server:
- Destination station, facing the border from the outside: "James Potter"
- Origin station, facing border: "South"
- Normal station: "Iron smelter"

The train schedule can be set up as following:

1. "Iron mine" until full
2. "North"
3. "Iron smelter"
4. "South"

When the train is located in the southern server, "Iron smelter" and "South" might show as red in the schedule. This is because the train is not able to see the destination server, and is expected. The same will happen for "Iron mine" and "North" when the train is located in the northern server.

Players can use temporary stations in each server to create schedules with stations not available in the current server. As long as the temporary stations aren't routable by the trains this should never cause conflicts.
