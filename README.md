# Clusterio gridworld

Automatic gridworld configuration

## [Documentation and FAQ](docs/docs.md)

## Installation

Dependencies:

* https://www.npmjs.com/package/@hornwitser/server_select
* https://www.npmjs.com/package/@clusterio/plugin-edge_transports

Run the following commands in the folder Clusterio is installed to:

	npm install @danielv123/gridworld
	npx clusteriocontroller plugin add @danielv123/gridworld
	npm install universal_edges
	npx clusteriocontroller plugin add universal_edges

Substitute clusteriocontroller with clusteriohost or clusterioctl if this a dedicated host or ctl installation respectively.

Install the companion mod as a modpack in clusterio, this is required for power, fluid transfers and train pathfinding to work:

https://mods.factorio.com/mod/universal_edges

## Usage

Open the web UI, navigate to the gridworld page and create a new gridworld. A lobby server will be created. If you want to use a custom map exchange string, navigate to the controller page and set "Gridworld map exchange string" to the long string you get from the game.

Once this is done, join the lobby server and press the "Joing game button". Additional server are created on demand as you explore. The load balancing picks the host with the fewest instances to create the new server on.

### Transfers between servers

The universal_edges plugin is used to transfer items between servers. When an edge is green, it is active and can be used for transfers. Connectors are set up by placing the following items up against the edge:

* Transport belts
* Pipes
* Substations
* Straight rails (the departing train can't leave from a curve, leave a long straight)

![Visualization of this repo](./images/diagram.svg)

## Development setup

Clone the repository in clusterio/external_plugins/

	git clone https://github.com/clusterio/clusterio
	cd clusterio/external_plugins
	git clone https://github.com/Danielv123/gridworld
	git clone https://github.com/clusterio/edge_transports
	cd ..
	pnpm install

Interactive:

	node packages/create --dev

	node packages/ctl plugin add ./external_plugins/gridworld
	node packages/ctl plugin add ./external_plugins/edge_transports
	pnpm install @hornwitser/server_select -w
	node packages/controller bootstrap create-admin Danielv123
	node packages/controller bootstrap create-ctl-config Danielv123
	node packages/controller plugin add @hornwitser/server_select
	node packages/controller plugin add ./plugins/global_chat
	node packages/controller plugin add ./plugins/inventory_sync
	node packages/controller plugin add ./plugins/player_auth
	node packages/controller plugin add ./plugins/research_sync
	node packages/controller plugin add ./plugins/statistics_exporter
	node packages/controller bootstrap generate-user-token Danielv123 > token.txt
	node packages/controller run --dev --dev-plugin gridworld

Log into the webui with the token in token.txt and create a new host token with id `1` then run the following in terminal to setup the host:

	wget -O factorio.tar.gz https://www.factorio.com/get-download/latest/headless/linux64
	tar -xf factorio.tar.gz
	node packages/host config set host.id 1
	node packages/host config set host.controller_token xxxxxxxxxxxxxxxxxxxxx
	node packages/host config set host.name "Host 1"
	node packages/host config set host.public_address "localhost"
  
Luacheck can be downloaded from https://github.com/mpeterv/luacheck/releases/download/0.23.0/luacheck.exe or `sudo apt install lua-check` or `brew install luacheck`

Put it in your `%path%` and run `luacheck ./module`
