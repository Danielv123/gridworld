"use strict";
const { libLink } = require("@clusterio/lib");

const migrateInstanceCommand = new libLink.Request({
	type: "migrate_instance",
	links: ["control-master"],
	permission: "core.instance.migrate",
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
