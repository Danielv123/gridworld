"use strict";
const lib = require("@clusterio/lib");

const MigrateInstanceRequest = require("./src/instance_migration/info/MigrateInstanceRequest");
const messages = require("./messages");

const pluginName = "gridworld";

// Define migrate instance permission
require("./src/instance_migration/info/migrateInstancePermission");

lib.definePermission({
	name: "gridworld.overview.view",
	title: "View gridworld overview",
	description: "View gridworld overview",
	grantByDefault: true,
});
lib.definePermission({
	name: "gridworld.create",
	title: "Create gridworld",
	description: "Create gridworld",
	grantByDefault: true,
});
lib.definePermission({
	name: "gridworld.map.refresh",
	title: "Refresh map tiles",
	description:
    "Load tile data from factorio and recreate images for web interface map",
	grantByDefault: true,
});
lib.definePermission({
	name: "gridworld.map.create_by_exploration",
	title: "Create servers by exploration",
	description:
    "Allow for new instances to be created by exploration through edge_teleports",
	grantByDefault: true,
});
lib.definePermission({
	name: "gridworld.map.start_by_exploration",
	title: "Start servers by exploration",
	description:
    "Allow for existing instances to be started by exploration through edge_teleports",
	grantByDefault: true,
});
lib.definePermission({
	name: "gridworld.faction.delete",
	title: "Delete faction",
	description: "Delete *any* faction",
	grantByDefault: false,
});

module.exports = {
	plugin: {
		name: pluginName,
		title: "Gridworld",
		description: "Generates a gridworld cluster layout",

		instanceEntrypoint: "instance",
		instanceConfigFields: {
			"gridworld.grid_x_position": {
				type: "number",
				title: "Server position on X axis",
				description: "Server position index along the X axis in the gridworld",
				initialValue: 1000,
			},
			"gridworld.grid_y_position": {
				type: "number",
				title: "Server position on Y axis",
				description: "Server position index along the Y axis in the gridworld",
				initialValue: 1000,
			},
			"gridworld.grid_x_size": {
				type: "number",
				title: "Server size on X axis",
				description: "Server size along the X axis",
				initialValue: 512,
			},
			"gridworld.grid_y_size": {
				type: "number",
				title: "Server size on Y axis",
				description: "Server size along the Y axis",
				initialValue: 512,
			},
			"gridworld.is_lobby_server": {
				type: "boolean",
				title: "Server is a lobby server",
				description: "Make this instance act as a lobby server for a gridworld",
				initialValue: false,
			},
			"gridworld.grid_id": {
				type: "number",
				title: "Grid ID",
				description:
          "Grid identifier - used to run multiple gridworlds on the same cluster",
				initialValue: 0,
			},
			"gridworld.grid_name_prefix": {
				type: "string",
				title: "Grid name prefix",
				description: "Prefix for autogeneration, only used for main lobby server where is_lobby_server = true",
				initialValue: "",
			},
			"gridworld.claimed_by_faction": {
				type: "string",
				title: "Claimed by faction",
				description: "Faction that has claimed this server",
				initialValue: "",
			},
		},

		controllerEntrypoint: "controller",
		controllerConfigFields: {
			"gridworld.autosave_interval": {
				type: "number",
				title: "Autosave Interval",
				description: "Interval the gridworld data is autosaved at in seconds.",
				initialValue: 600, // 10 minutes
			},
			"gridworld.gridworld_seed": {
				type: "number",
				title: "Gridworld seed",
				description: "Seed for servers created using gridworld generator",
				initialValue: 999,
			},
			"gridworld.gridworld_map_exchange_string": {
				type: "string",
				title: "Gridworld map exchange string",
				description:
          "Map exchange string for servers created using gridworld generator",
				initialValue:
          // eslint-disable-next-line max-len
          ">>>eNpjZGBk0GIAgwZ7EOZgSc5PzIHwDjiAMFdyfkFBapFuflEqsjBnclFpSqpufiaq4tS81NxK3aTEYqhiiMkcmUX5eegmsBaX5OehipQUpaYWw5wCwtylRYl5maW5EL0H7OGqGb+qrnZoaJFjAOH/9QwK//+DMJD1AGgjCDMwNoBVMwLFYIA1OSczLY2BQcERiJ1A0owMjNUi69wfVk0BMsFAzwHK+AAVOZAEE/GEMfwccEqpwBgmSOYYg8FnJAbE0hKQ/RBVHA4IBkSyBSTJyNj7duuC78cu2DH+Wfnxkm9Sgj2joavIuw9G6+yAkuwgfzLBiVkzQWAnzCsMMDMf2EOlbtoznj0DAm/sGVlBOkRAhIMFkDjgzczAKMAHZC3oARIKMgwwp9nBjBFxYEwDg28wnzyGMS7bo/sDGBA2IMPlQMQJEAG2EO4yRgjTod+B0UEeJiuJUALUb8SA7IYUhA9Pwqw9jGQ/mkMwIwLZH2giKg5YooELZGEKnHjBDHcNMDwvsMN4DvMdGJlBDJCqL0AxCA8kAzMKQgs4gIObmQEBPtgzuMX47gAAJhSjWw==<<<",
			},
			"gridworld.tiles_directory": {
				type: "string",
				title: "Tiles directory",
				description: "Folder to store map tiles relative to database",
				initialValue: "tiles",
			},
		},

		webEntrypoint: "./web",
		routes: [
			"/gridworld",
			"/gridworld/create",
			"/gridworld/factions",
			"/gridworld/factions/:factionId/view",
		],

		messages: [
			MigrateInstanceRequest,
			...Object.keys(messages).map(key => messages[key]),
		],
	},
};
