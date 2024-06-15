"use strict";

const messages = require("../../messages");
const createFactionGrid = require("../worldgen/factionGrid/createFactionGrid");

module.exports = async function createRequestHandler(message) {
	// message.data === {
	// name_prefix: "Gridworld",
	// use_edge_transports: true,
	// x_size: 500, y_size: 500,
	// host: host_id - should be picked automatically from connected hosts
	// }

	// Create a new gridworld. We also need to store the x_size and y_size somewhere.
	if (!message.data.use_edge_transports) { return; }
	const grid = await createFactionGrid({
		plugin: this,
		name_prefix: message.data.name_prefix,
		hostId: message.data.host,
		x_size: message.data.x_size,
		y_size: message.data.y_size,
	});

	// Store in the controller database
	this.gridworldDatastore.set(grid.grid_id, {
		lobby_server: grid.lobby_server,
		id: grid.grid_id,
		name_prefix: message.data.name_prefix,
		x_size: message.data.x_size,
		y_size: message.data.y_size,
		use_edge_transports: message.data.use_edge_transports,
	});

	// Send update to all connected clients
	for (let sub of this.subscribedControlLinks) {
		if (sub.gridworlds) {
			await this.controller.sendTo(sub.link, new messages.GridworldUpdates([this.gridworldDatastore.get(grid.grid_id)]));
		}
	}

	return {
		ok: true,
		message: "Gridworld created",
	};
};
