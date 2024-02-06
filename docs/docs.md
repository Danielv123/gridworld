# Gridworld documentation

## Goals

The goal of the gridworld project is to make an easy to use (near) infinitely scaleable factorio MMO experience. There are a few self imposed restrictions:

* Should be a clusterio plugin
* Don't require a mod for core functionality
* Near seamless player experience
* Easy to set up
* Vanilla compatibility - it should be possible to take a gridworld cluster and stitch it together by moving entities into a single world without breaking the factory.

Far fetched goals:

* Automatically merge worlds into a single large world for showing off/benchmarking/consistency checking
* Bungeecord like proxy in front of the servers to present the correct playercount to the matchmaker and allowing for smart routing of players to the correct server
* Matchmaking system?
* Allow players to create and host servers from GUI on the lobby server

## Implementation details

The current version of the plugin has the following flow:

1. Installation
1. User clicks "create new gridworld" and enters their preferred grid cell size and the host used to host the lobby server
1. User clicks "create gridworld"
1. The plugin creates a lobby server with a new grid_id
the web map

The following improvements should be made:

* The map on the website should do partial updates as new tiles are generated/placed in the world.

After the above steps are performed the gridworld is ready for sharing with the world. The following docs covers the rest of the backend and runtime details:

* [Factions overview](factions/factions%20overview.md)
* [Worldgen overview](worldgen/worldgen%20overview.md)

## Development setup

Clone the repository in clusterio/external_plugins/ and run the following:

	cd clusterio
	pnpm install
	node packages/ctl plugin add ./external_plugins/gridworld
	pnpm install @clusterio/plugin-edge_transports -w
	pnpm install @hornwitser/server_select -w
	node packages/controller/ bootstrap create-admin Danielv123
	node packages/controller plugin add @clusterio/plugin-edge_transports
	node packages/controller plugin add @hornwitser/server_select
	node packages/controller plugin add ./plugins/global_chat
	node packages/controller plugin add ./plugins/inventory_sync
	node packages/controller plugin add ./plugins/player_auth
	node packages/controller plugin add ./plugins/research_sync
	node packages/controller plugin add ./plugins/statistics_exporter
	node packages/controller/ bootstrap generate-user-token Danielv123 > token.txt
	node packages/controller run --dev --dev-plugin gridworld

Luacheck can be downloaded from https://github.com/mpeterv/luacheck/releases/download/0.23.0/luacheck.exe

Put it in your `%path%` and run `luacheck ./module`

Much of this can be automated using the devcontainer in the repo or using github codespaces.
