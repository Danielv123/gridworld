"use strict";
const { libLink } = require("@clusterio/lib");

const migrateInstanceCommand = new libLink.Request({
	type: "gridworld:migrate_instance",
	links: ["control-master"],
	permission: "gridworld.migrate_instance",
	requestProperties: {
		"instance_id": { type: "integer" },
		"slave_id": { type: "integer" },
	},
	responseProperties: {
		"status": {
			type: "string",
			enum: ["success", "failure"],
		},
	},
});

module.exports = migrateInstanceCommand;
