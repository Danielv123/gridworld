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

module.exports = {
	name: "gridworld",
	title: "Gridworld",
	description: "Generates a gridworld cluster layout",

	instanceEntrypoint: "instance",
	InstanceConfigGroup,

	masterEntrypoint: "master",
	MasterConfigGroup,

	webEntrypoint: "./web",
	routes: ["/gridworld/overview"],

	messages: {
		create: new libLink.Request({
			type: "gridworld:create",
			links: ["control-master"],
			permission: "gridworld.create",
			requestProperties: {
				"name_prefix": { type: "string" },
				"use_edge_transports": { type: "boolean" },
				"x_size": { type: "integer" },
				"y_size": { type: "integer" },
				"x_count": { type: "integer" },
				"y_count": { type: "integer" },
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
	},
};
