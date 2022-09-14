"use strict";

const assignInstance = require("../worldgen/assignInstance");
const createInstance = require("../worldgen/createInstance");
const createLobbyServer = require("../worldgen/createLobbyServer");
const createSave = require("../worldgen/createSave");
const getEdges = require("../worldgen/getEdges");

module.exports = async function createRequestHandler(message) {
	// message.data === {
	// name_prefix: "Gridworld",
	// use_edge_transports: true,
	// x_size: 500, y_size: 500,
	// x_count: 2, y_count: 2,
	// slave: slave_id
	// }
	// Create a new gridworld.
	let instances = [];

	if (!message.data.use_edge_transports) { return; }
	const lobby_server = await createLobbyServer(this, message.data.slave);
	try {
		for (let x = 1; x <= message.data.x_count; x++) {
			for (let y = 1; y <= message.data.y_count; y++) {
				// Create instance
				let instance = {
					instanceId: await createInstance(
						this,
						`${message.data.name_prefix} x${x} y${y}`,
						x,
						y,
						message.data.x_size,
						message.data.y_size,
						lobby_server.config.get("gridworld.grid_id"),
					),
					x,
					y,
					slaveId: message.data.slave,
				};
				// Assign instance to a slave (using first slave as a placeholder)
				await assignInstance(this, instance.instanceId, instance.slaveId);

				// Create map
				await createSave(
					this,
					instance.instanceId,
					this.master.config.get("gridworld.gridworld_seed"),
					this.master.config.get("gridworld.gridworld_map_exchange_string")
				);

				instances.push(instance);
			}
		}
		// Create edges and configure edge_transports
		if (!message.data.use_edge_transports) { return; }
		for (let x = 1; x <= message.data.x_count; x++) {
			for (let y = 1; y <= message.data.y_count; y++) {
				// Create edges and add to edge_transports settings
				let instanceTemplate = instances.find(instance => instance.x === x && instance.y === y);
				let field = "edge_transports.internal";
				let value = {
					edges: [],
				};

				// x positive is right
				// y positive is down

				let edges = getEdges({
					message,
					x_size: message.data.x_size,
					y_size: message.data.y_size,
					x,
					y,
					instances,
				});

				value.edges.push(...edges);

				// Update instance with edges
				await this.setInstanceConfigField(instanceTemplate.instanceId, field, value);
			}
		}
	} catch (e) {
		this.logger.error(e);
	}
};
