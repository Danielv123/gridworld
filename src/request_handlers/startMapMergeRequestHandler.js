"use strict";
const lib = require("@clusterio/lib");

const assignInstance = require("../worldgen/assignInstance");
const createSave = require("../worldgen/createSave");

module.exports = async function startMapMergeRequestHandler(message) {
	// message === {
	// grid_id: "grid_id",
	// host_id: "host_id",
	// }

	// Create a new instance on the target host
	const name = `Map Merge ${message.grid_id}`;
	this.logger.info(`Creating instance for map merging ${name}`);
	let instanceConfig = new lib.InstanceConfig("controller");
	instanceConfig.set("instance.name", name);

	let instanceId = instanceConfig.get("instance.id");
	if (plugin.controller.instances.has(instanceId)) {
		throw new lib.RequestError(`Instance with ID ${instanceId} already exists`);
	}

	// Add common settings for the Factorio server
	let settings = {
		...instanceConfig.get("factorio.settings"),

		"name": `${this.controller.config.get("controller.name")} - ${name}`,
		"description": `Clusterio instance for ${this.controller.config.get("controller.name")}`,
		"tags": ["clusterio", "gridworld"],
		"visibility": { "public": true, "lan": true },
		"require_user_verification": true,
		"auto_pause": false,
	};
	instanceConfig.set("factorio.settings", settings);

	const mergeTargetInstance = new InstanceInfo(instanceConfig, "unassigned", undefined, Date.now());
	this.controller.instances.set(instanceId, mergeTargetInstance);
	await lib.invokeHook(this.controller.plugins, "onInstanceStatusChanged", mergeTargetInstance, null);
	this.controller.addInstanceHooks(mergeTargetInstance);

	// Assign instance to a host
	await assignInstance(this, instanceId, message.host_id);

	// Create savefile
	await createSave(
		this,
		instanceId,
		this.controller.config.get("gridworld.gridworld_seed"),
		this.controller.config.get("gridworld.gridworld_map_exchange_string")
	);

	// Start instance
	await this.controller.sendTo({ instanceId }, new lib.InstanceStartRequest());

	// Get instances with the same grid_id
	const instances = this.controller.instances.filter(instance => instance.config.get("gridworld.grid_id") === message.grid_id);
	for (let instance of instances) {
		// Generate chunks in target area on merge target
		const grid_x_size = instance.config.get("gridworld.grid_x_size");
		const grid_y_size = instance.config.get("gridworld.grid_y_size");
		const grid_x_position = instance.config.get("gridworld.grid_x_position");
		const grid_y_position = instance.config.get("gridworld.grid_y_position");
		const leftTop = [grid_x_position * grid_x_size, grid_y_position * grid_y_size];
		const rightBottom = [(grid_x_position + 1) * grid_x_size, (grid_y_position + 1) * grid_y_size];
		const command = `/c gridworld.merge_map.prepare_chunks({${leftTop[0]}, ${leftTop[1]}}, {${rightBottom[0]}, ${rightBottom[1]})`;
		const status = await this.controller.sendTo({ instanceId }, new lib.InstanceSendRconRequest(command));
		this.logger.info(`Prepare chunks status for ${instance.name}: ${status}`);
	}

	for (let instance of instances) {
		// Ensure the instance is running
		if (instance.status === "stopped") {
			this.logger.info(`Starting instance ${instance.name}`);
			await this.controller.sendTo({ instanceId: instance.id }, new lib.InstanceStartRequest());
		}

		// Perform tile dump

		// Perform entity dump

	}
};
