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

Substitute clusteriocontroller with clusteriohost or clusterioctl if this a dedicated host or ctl installation respectively.

![Visualization of this repo](./images/diagram.svg)

## Development setup

Clone the repository in clusterio/external_plugins/

	cd clusterio
	pnpm install
	node packages/create --dev # Interactive
	node packages/ctl plugin add ./external_plugins/gridworld
	pnpm install @clusterio/plugin-edge_transports -w
	pnpm install @hornwitser/server_select -w
	node packages/controller bootstrap create-ctl-config Danielv123
	node packages/controller bootstrap create-admin Danielv123
	node packages/controller plugin add @clusterio/plugin-edge_transports
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
  
Luacheck can be downloaded from https://github.com/mpeterv/luacheck/releases/download/0.23.0/luacheck.exe or `sudo apt install lua-check`

Put it in your `%path%` and run `luacheck ./module`

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ1c2VyIiwidXNlciI6IkRhbmllbHYxMjMiLCJpYXQiOjE3MDcwNjYwNDR9.g9iiIDvhX8GrEWGQQYig_smOdf212dmst6HKg9LKU3g