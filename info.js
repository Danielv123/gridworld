"use strict";
const { libConfig, libLink, libUsers } = require("@clusterio/lib");

class MasterConfigGroup extends libConfig.PluginConfigGroup { }
MasterConfigGroup.defaultAccess = ["master", "slave", "control"];
MasterConfigGroup.groupName = "gridworld";
MasterConfigGroup.define({
	name: "autosave_interval",
	title: "Autosave Interval",
	description: "Interval the gridworld data is autosaved at in seconds.",
	type: "number",
	initial_value: 600, // 10 minutes
});
MasterConfigGroup.define({
	name: "gridworld_seed",
	title: "Gridworld seed",
	description: "Seed for servers created using gridworld generator",
	type: "number",
	initial_value: 999,
});
MasterConfigGroup.define({
	name: "gridworld_map_exchange_string",
	title: "Gridworld map exchange string",
	description: "Map exchange string for servers created using gridworld generator",
	type: "string",
	// eslint-disable-next-line max-len
	initial_value: ">>>eNpjZGBk0GIAgwZ7EOZgSc5PzIHwDjiAMFdyfkFBapFuflEqsjBnclFpSqpufiaq4tS81NxK3aTEYqhiiMkcmUX5eegmsBaX5OehipQUpaYWw5wCwtylRYl5maW5EL0H7OGqGb+qrnZoaJFjAOH/9QwK//+DMJD1AGgjCDMwNoBVMwLFYIA1OSczLY2BQcERiJ1A0owMjNUi69wfVk0BMsFAzwHK+AAVOZAEE/GEMfwccEqpwBgmSOYYg8FnJAbE0hKQ/RBVHA4IBkSyBSTJyNj7duuC78cu2DH+Wfnxkm9Sgj2joavIuw9G6+yAkuwgfzLBiVkzQWAnzCsMMDMf2EOlbtoznj0DAm/sGVlBOkRAhIMFkDjgzczAKMAHZC3oARIKMgwwp9nBjBFxYEwDg28wnzyGMS7bo/sDGBA2IMPlQMQJEAG2EO4yRgjTod+B0UEeJiuJUALUb8SA7IYUhA9Pwqw9jGQ/mkMwIwLZH2giKg5YooELZGEKnHjBDHcNMDwvsMN4DvMdGJlBDJCqL0AxCA8kAzMKQgs4gIObmQEBPtgzuMX47gAAJhSjWw==<<<",
});
MasterConfigGroup.define({
	name: "tiles_directory",
	title: "Tiles directory",
	description: "Folder to store map tiles relative to database",
	type: "string",
	initial_value: "tiles",
});
MasterConfigGroup.finalize();

class InstanceConfigGroup extends libConfig.PluginConfigGroup { }
InstanceConfigGroup.defaultAccess = ["master", "slave", "control"];
InstanceConfigGroup.groupName = "gridworld";
InstanceConfigGroup.define({
	name: "grid_x_position",
	title: "Server position on X axis",
	description: "Server position index along the X axis in the gridworld",
	type: "number",
	initial_value: 1000,
});
InstanceConfigGroup.define({
	name: "grid_y_position",
	title: "Server position on Y axis",
	description: "Server position index along the Y axis in the gridworld",
	type: "number",
	initial_value: 1000,
});
InstanceConfigGroup.define({
	name: "grid_x_size",
	title: "Server size on X axis",
	description: "Server size along the X axis",
	type: "number",
	initial_value: 512,
});
InstanceConfigGroup.define({
	name: "grid_y_size",
	title: "Server size on Y axis",
	description: "Server size along the Y axis",
	type: "number",
	initial_value: 512,
});
InstanceConfigGroup.finalize();

libUsers.definePermission({
	name: "gridworld.overview.view",
	title: "View gridworld overview",
	description: "View gridworld overview",
	grantByDefault: true,
});
libUsers.definePermission({
	name: "gridworld.create",
	title: "Create gridworld",
	description: "Create gridworld",
	grantByDefault: true,
});
libUsers.definePermission({
	name: "gridworld.map.refresh",
	title: "Refresh map tiles",
	description: "Load tile data from factorio and recreate images for web interface map",
	grantByDefault: true,
});

module.exports = {
	name: "gridworld",
	title: "Gridworld",
	description: "Generates a gridworld cluster layout",

	instanceEntrypoint: "instance",
	InstanceConfigGroup,

	masterEntrypoint: "master",
	MasterConfigGroup,

	webEntrypoint: "./web",
	routes: [
		"/gridworld",
		"/gridworld/create",
	],

	messages: {
		create: new libLink.Request({
			type: "gridworld:create",
			links: ["control-master"],
			permission: "gridworld.create",
			requestProperties: {
				name_prefix: { type: "string" },
				use_edge_transports: { type: "boolean" },
				x_size: { type: "integer" },
				y_size: { type: "integer" },
				x_count: { type: "integer" },
				y_count: { type: "integer" },
				slave: { type: "integer" }, // slaveID to use for instance creation
			},
		}),
		getMapData: new libLink.Request({
			type: "gridworld:get_map_data",
			links: ["control-master"],
			permission: "gridworld.overview.view",
			responseProperties: {
				map_data: {
					type: "array",
					items: {
						type: "object",
						additionalProperties: false,
						properties: {
							instance_id: { type: "integer" },
							center: { type: "array", items: { type: "number" } },
							bounds: {
								type: "array", items: {
									type: "array",
									items: { type: "number" },
								},
							},
							edges: {
								type: "array",
								items: {
									type: "object",
									properties: {
										id: { type: "integer" },
										origin: {
											type: "array",
											items: { type: "integer" },
										},
										surface: { type: "integer" },
										direction: { type: "integer" },
										length: { type: "integer" },
										target_instance: { type: "integer" },
										target_edge: { type: "integer" },
									},
								},
							},
						},
					},
				},
			},
		}),
		populateNeighborData: new libLink.Request({
			type: "gridworld:populate_neighbor_data",
			links: ["master-slave", "slave-instance"],
			forwardTo: "instance",
			requestProperties: {
				north: { type: ["integer", "null"] },
				south: { type: ["integer", "null"] },
				east: { type: ["integer", "null"] },
				west: { type: ["integer", "null"] },
			},
		}),
		teleportPlayer: new libLink.Request({
			type: "gridworld:teleport_player",
			links: ["instance-slave", "slave-master", "master-slave", "slave-instance"],
			forwardTo: "instance",
			requestProperties: {
				player_name: { type: "string" },
				x: { type: "number" },
				y: { type: "number" },
			},
		}),
		getTileData: new libLink.Request({
			type: "gridworld:get_tile_data",
			links: ["master-slave", "slave-instance"],
			forwardTo: "instance",
			requestProperties: {
				position_a: { type: "array", items: { type: "number" } },
				position_b: { type: "array", items: { type: "number" } },
			},
			responseProperties: {
				tile_data: {
					type: "array",
					items: {
						type: "object",
						additionalProperties: false,
						properties: {
							c: {
								type: "object",
								properties: {
									r: { type: "number" },
									g: { type: "number" },
									b: { type: "number" },
									a: { type: "number" },
								},
							},
						},
					},
				},
			},
		}),
		refreshTileData: new libLink.Request({
			type: "gridworld:refresh_tile_data",
			links: ["control-master"],
			permission: "gridworld.map.refresh",
			requestProperties: {
				instance_id: { type: "integer" },
			},
		}),
	},
};
