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
		// acquire: new libLink.Request({
		// 	type: "gridworld:acquire",
		// 	links: ["instance-slave", "slave-master"],
		// 	forwardTo: "master",
		// 	requestProperties: {
		// 		"instance_id": { type: "integer" },
		// 		"player_name": { type: "string" },
		// 	},
		// 	responseRequired: ["status"],
		// 	responseProperties: {
		// 		"status": { enum: ["acquired", "error", "busy"] },
		// 		"generation": { type: "integer" },
		// 		"has_data": { type: "boolean" },
		// 		"message": { type: "string" },
		// 	},
		// }),
		create: new libLink.Request({
			type: "gridworld:create",
			links: ["control-master"],
			permission: "gridworld.create",
			requestProperties: {
				"x_size": { type: "integer" },
				"y_size": { type: "integer" },
				"x_count": { type: "integer" },
				"y_count": { type: "integer" },
			},
		}),
	},
};
