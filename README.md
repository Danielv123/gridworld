# Clusterio gridworld

Automatic gridworld configuration

Dependencies:

* https://www.npmjs.com/package/@hornwitser/server_select
* https://www.npmjs.com/package/@clusterio/plugin-edge_transports

## Installation

Run the following commands in the folder Clusterio is installed to:

    npm install @danielv123/gridworld
    npx clusteriomaster plugin add @danielv123/gridworld

Substitute clusteriomaster with clusterioslave or clusterioctl if this a dedicated slave or ctl installation respectively.

## Development setup

Clone the repository to a folder adjacent to your clusterio repository

    cd clusterio
    npm install
    npx lerna bootstrap --hoist
    npx lerna run build
    cd packages/lib
    npm link
    cd ../../../gridworld
    npm install
    npm link @clusterio/lib
    cd ../clusterio
    node packages/master plugin add ../gridworld
    npm install @clusterio/plugin-edge_transports
    node packages/master plugin add @clusterio/plugin-edge_transports
    npm install @hornwitser/server_select
    node packages/master plugin add @hornwitser/server_select
    node packages/master run --dev --dev-plugin gridworld

Luacheck can be downloaded from https://github.com/mpeterv/luacheck/releases/download/0.23.0/luacheck.exe

Put it in your `%path%` and run `luacheck ./module`
