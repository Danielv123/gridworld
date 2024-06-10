"use strict";

const mapFind = require("../util/mapFind");
const getEdges = require("../worldgen/getEdges");

/**
 * Update edge transports edges for a grid square instance
 * @param {object} message Message as defined by UpdateEdgeTransportEdges
 * @param {object} message.data - The message data
 * @param {number} message.data.instance_id - The instance ID of the instance to update edge transports for
 */
module.exports = async function updateEdgeTransportsEdges(message) {
	const instance = this.controller.instances.get(message.data.instance_id);

	if (!instance) {
		this.logger.error(`Instance ${message.data.instance_id} not found`);
		return;
	}
	if (!instance.config.get("gridworld.is_grid_square")) {
		return;
	}

	const x = instance.config.get("gridworld.grid_x_position");
	const y = instance.config.get("gridworld.grid_y_position");
	const grid_id = instance.config.get("gridworld.grid_id");
	// Get x_size and y_size from lobby server
	const lobby_server = mapFind(this.controller.instances, i => i.config.get("gridworld.grid_id") === grid_id
		&& i.config.get("gridworld.is_lobby_server")
	);
	const x_size = lobby_server.config.get("gridworld.grid_x_size");
	const y_size = lobby_server.config.get("gridworld.grid_y_size");

	// Apply edge transports configuration
	const edges = getEdges({
		x_size,
		y_size,
		x,
		y,
		instances: this.controller.instances,
		grid_id,
		instanceId: message.data.instance_id,
	});

	// Set config
	this.logger.info(`Set edges on new instance ${message.data.instance_id}`);
	edges.forEach(edge => {
		this.controller.plugins.get("universal_edges").handleSetEdgeConfigRequest({ edge });
	});
};
