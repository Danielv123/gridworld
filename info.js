"use strict";
const { libConfig, libLink, libUsers } = require("@clusterio/lib");

const factionProperties = require("./src/factions/faction_message_properties");
const migrateInstanceCommandRequest = require("./src/instance_migration/info/migrateInstanceCommandRequest");

// Define migrate instance permission
require("./src/instance_migration/info/migrateInstancePermission");

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
InstanceConfigGroup.define({
	name: "is_lobby_server",
	title: "Server is a lobby server",
	description: "Make this instance act as a lobby server for a gridworld",
	type: "boolean",
	initial_value: false,
});
InstanceConfigGroup.define({
	name: "grid_id",
	title: "Grid ID",
	description: "Grid identifier - used to run multiple gridworlds on the same cluster",
	type: "number",
	initial_value: 0,
});
InstanceConfigGroup.define({
	name: "claimed_by_faction",
	title: "Claimed by faction",
	description: "Faction that has claimed this server",
	type: "string",
	initial_value: "",
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
libUsers.definePermission({
	name: "gridworld.map.create_by_exploration",
	title: "Create servers by exploration",
	description: "Allow for new instances to be created by exploration through edge_teleports",
	grantByDefault: true,
});
libUsers.definePermission({
	name: "gridworld.map.start_by_exploration",
	title: "Start servers by exploration",
	description: "Allow for existing instances to be started by exploration through edge_teleports",
	grantByDefault: true,
});
libUsers.definePermission({
	name: "gridworld.faction.delete",
	title: "Delete faction",
	description: "Delete *any* faction",
	grantByDefault: false,
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
		"/gridworld/factions",
		"/gridworld/factions/:factionId/view",
	],

	messages: {
		createFactionGrid: new libLink.Request({
			type: "gridworld:create",
			links: ["control-master"],
			permission: "gridworld.create",
			requestProperties: {
				name_prefix: { type: "string" },
				use_edge_transports: { type: "boolean" },
				x_size: { type: "integer" },
				y_size: { type: "integer" },
				slave: { type: "integer" }, // slaveID to use for instance creation
			},
		}),
		getMapData: new libLink.Request({
			type: "gridworld:get_map_data",
			links: ["control-master", "instance-slave", "slave-master"],
			permission: "gridworld.overview.view",
			forwardTo: "master",
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
		updateEdgeTransportEdges: new libLink.Request({
			type: "gridworld:update_edge_transport_edges",
			links: ["instance-slave", "slave-master"],
			forwardTo: "master",
			requestProperties: {
				instance_id: { type: "integer" },
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
		playerPosition: new libLink.Event({
			type: "gridworld:player_position",
			links: ["instance-slave", "slave-master", "master-control"],
			forwardTo: "master",
			eventProperties: {
				player_name: { type: "string" },
				instance_id: { type: "integer" },
				x: { type: "number" },
				y: { type: "number" },
			},
		}),
		setWebSubscription: new libLink.Request({
			type: "gridworld:set_web_subscription",
			links: ["control-master"],
			permission: "gridworld.overview.view",
			requestProperties: {
				player_position: { type: "boolean" },
				faction_list: { type: "boolean" },
			},
		}),
		startInstance: new libLink.Request({
			type: "gridworld:start_instance",
			links: ["instance-slave", "slave-master"],
			forwardTo: "master",
			requestProperties: {
				instance_id: { type: "integer" },
				save: { type: ["string", "null"] },
			},
		}),
		createFaction: new libLink.Request({
			type: "gridworld:create_faction",
			links: ["instance-slave", "slave-master"],
			forwardTo: "master",
			requestProperties: factionProperties,
			responseProperties: {
				ok: { type: "boolean" },
				faction: {
					type: "object",
					properties: factionProperties,
				},
			},
		}),
		/**
		 * Send updated faction data to master for propagation throughout the cluster
		 * Used to edit factions
		 */
		updateFaction: new libLink.Request({
			type: "gridworld:update_faction",
			links: ["instance-slave", "slave-master"],
			forwardTo: "master",
			requestProperties: {
				faction_id: { type: "string" },
				name: { type: "string" },
				open: { type: "boolean" },
				about: {
					type: "object",
					properties: {
						header: { type: "string" },
						description: { type: "string" },
						rules: { type: "string" },
					},
				},
			},
			responseRequired: ["ok", "message"],
			responseProperties: {
				ok: { type: "boolean" },
				message: { type: "string" },
				faction: {
					type: "object",
					properties: factionProperties,
				},
			},
		}),
		/**
		 * Event notifying an instance of changes to a faction
		 */
		factionUpdate: new libLink.Event({
			type: "gridworld:faction_update",
			links: ["master-slave", "slave-instance", "master-control"],
			broadcastTo: "instance",
			eventProperties: {
				faction: {
					type: "object",
					properties: factionProperties,
				},
			},
		}),
		/**
		 * Get changed factions
		 */
		refreshFactionData: new libLink.Request({
			type: "gridworld:refresh_faction_data",
			links: ["instance-slave", "slave-master"],
			forwardTo: "master",
			responseProperties: {
				ok: { type: "boolean" },
				message: { type: "string" },
				factions: {
					type: "array",
					items: {
						type: "object",
						properties: factionProperties,
					},
				},
			},
		}),
		factionInvitePlayer: new libLink.Request({
			type: "gridworld:faction_invite_player",
			links: ["instance-slave", "slave-master"],
			forwardTo: "master",
			requestProperties: {
				faction_id: { type: "string" },
				player_name: { type: "string" },
				role: { type: "string" },
			},
			responseProperties: {
				ok: { type: "boolean" },
				message: { type: "string" },
			},
		}),
		joinFaction: new libLink.Request({
			type: "gridworld:join_faction",
			links: ["instance-slave", "slave-master"],
			forwardTo: "master",
			requestProperties: {
				faction_id: { type: "string" },
				player_name: { type: "string" },
			},
			responseProperties: {
				ok: { type: "boolean" },
				message: { type: "string" },
			},
		}),
		leaveFaction: new libLink.Request({
			type: "gridworld:leave_faction",
			links: ["instance-slave", "slave-master"],
			forwardTo: "master",
			requestProperties: {
				faction_id: { type: "string" },
				player_name: { type: "string" },
			},
			responseProperties: {
				ok: { type: "boolean" },
				message: { type: "string" },
			},
		}),
		factionChangeMemberRole: new libLink.Request({
			type: "gridworld:faction_change_member_role",
			links: ["instance-slave", "slave-master"],
			forwardTo: "master",
			requestProperties: {
				faction_id: { type: "string" },
				player_name: { type: "string" },
				role: factionProperties.members.items.properties.role,
			},
			responseProperties: {
				ok: { type: "boolean" },
				message: { type: "string" },
			},
		}),
		claimServer: new libLink.Request({
			type: "gridworld:claim_server",
			links: ["instance-slave", "slave-master"],
			forwardTo: "master",
			requestProperties: {
				instance_id: { type: "integer" },
				player_name: { type: "string" },
				faction_id: { type: "string" },
			},
			responseProperties: {
				ok: { type: "boolean" },
				message: { type: "string" },
			},
		}),
		unclaimServer: new libLink.Request({
			type: "gridworld:unclaim_server",
			links: ["instance-slave", "slave-master"],
			forwardTo: "master",
			requestProperties: {
				instance_id: { type: "integer" },
				player_name: { type: "string" },
			},
			responseProperties: {
				ok: { type: "boolean" },
				message: { type: "string" },
			},
		}),
		joinGridworld: new libLink.Request({
			type: "gridworld:join_gridworld",
			links: ["instance-slave", "slave-master"],
			forwardTo: "master",
			requestProperties: {
				player_name: { type: "string" },
				grid_id: { type: "integer" },
			},
			responseRequired: ["ok", "message"],
			responseProperties: {
				ok: { type: "boolean" },
				message: { type: "string" },
				connection_address: { type: "string" },
				server_name: { type: "string" },
				server_description: { type: "string" },
			},
		}),
		performEdgeTeleport: new libLink.Request({
			type: "gridworld:perform_edge_teleport",
			links: ["instance-slave", "slave-master"],
			forwardTo: "master",
			requestProperties: {
				player_name: { type: "string" },
				player_x_position: { type: "number" },
				player_y_position: { type: "number" },
				grid_id: { type: "integer" },
			},
			responseRequired: ["ok", "message"],
			responseProperties: {
				ok: { type: "boolean" },
				message: { type: "string" },
				connection_address: { type: "string" },
				server_name: { type: "string" },
				server_description: { type: "string" },
				instance_id: { type: "integer" },
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
						type: "string",
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
		setLoadFactor: new libLink.Event({
			type: "gridworld:set_load_factor",
			links: ["instance-slave", "slave-master"],
			forwardTo: "master",
			eventProperties: {
				instance_id: { type: "integer" },
				load_factor: { type: "number" },
			},
		}),
	},
};
