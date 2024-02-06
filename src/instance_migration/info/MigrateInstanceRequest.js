"use strict";
const { libLink } = require("@clusterio/lib");

class MigrateInstanceRequest {
	static type = "request";
	static src = "control";
	static dst = "controller";
	static permission = "gridworld.migrate_instance";
	static jsonSchema = {
		type: "object",
		properties: {
			instance_id: { type: "integer" },
			host_id: { type: "integer" },
		},
		required: ["instance_id", "host_id"],
		additionalProperties: false,
	};
	static Response = {
		jsonSchema: {
			type: "object",
			properties: {
				status: {
					type: "string",
					enum: ["success", "failure"],
				},
			},
			required: ["status"],
			additionalProperties: false,
		},
	};
}

module.exports = MigrateInstanceRequest;
