"use strict";

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
	const grid = createFactionGrid({
		plugin: this,
		hostId: message.data.host,
		x_size: message.data.x_size,
		y_size: message.data.y_size,
	});
};
