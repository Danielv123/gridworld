"use strict";

const { plainJson } = require("@clusterio/lib");

class MigrateInstanceRequest {
	static type = "request";
	static src = "control";
	static dst = "controller";
	static plugin = "gridworld";
	static permission = "gridworld.migrate_instance";
	constructor(instance_id, host_id) {
		this.instance_id = instance_id;
		this.host_id = host_id;
	}
	static jsonSchema = {
		type: "object",
		properties: {
			instance_id: { type: "integer" },
			host_id: { type: "integer" },
		},
		required: ["instance_id", "host_id"],
		additionalProperties: false,
	};
	static fromJSON(json) {
		return new this(json.instance_id, json.host_id);
	}
	static Response = plainJson({
		type: "object",
		properties: {
			status: {
				type: "string",
				enum: ["success", "failure"],
			},
		},
		required: ["status"],
		additionalProperties: false,
	});
};

module.exports = MigrateInstanceRequest;
