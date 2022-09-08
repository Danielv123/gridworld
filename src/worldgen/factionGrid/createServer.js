"use strict";

const assignInstance = require("../assignInstance");
const createInstance = require("../createInstance");
const createSave = require("../createSave");
const getEdges = require("../getEdges");

const edge_target_position_offets = [
	{},
	[0, -1],
	[0, 1],
	[1, 0],
	[-1, 0],
]

module.exports = async function createServer({
	plugin,
	slaveId,
	x,
	y,
	x_size,
	y_size,
	grid_id,
}) {
	// Create instance
	const instanceId = await createInstance(plugin, `Grid square ${Math.floor(Math.random() * 2 ** 16).toString()}`, x, y, x_size, y_size, grid_id);

	// Find slave with free capacity
	const slaveId = 0;

	// Assign instance to slave
	await assignInstance(plugin, instanceId, slaveId);

	// Create savefile
	await createSave(plugin, instanceId, plugin.master.config.get("gridworld.gridworld_seed"), plugin.master.config.get("gridworld.gridworld_map_exchange_string"));

	// Apply edge transports configuration
	const edges = await getEdges({
		x_size,
		y_size,
		x,
		y,
	});

	// Find neighboring instances and update edge target instance ID
	for (const edge of edges) {
		const target_position = [
			x + edge_target_position_offets[edge.id][0],
			y + edge_target_position_offets[edge.id][1]
		];
		for (const instance in plugin.master.instances) {
			if (
				instance.config.get("gridworld.grid_id") === grid_id
				&& instance.config.get("gridworld.grid_x_position") === target_position[0]
				&& instance.config.get("gridworld.grid_y_position") === target_position[1]
			) {
				// Update local instance edge configuration
				edge.target_instance = instance.config.get("instance.id");
				// Update target instance edge configuration
				const edge_transports_config = instance.config.get("edge_transports.internal");
				edge_transports_config.edges.find(x => x.id === edge.target_edge).target_instance = instanceId;
				plugin.setInstanceConfigField(edge.target_instance, "edge_transports.internal", edge_transports_config);
			}
		}
	}

	// Set config
	plugin.setInstanceConfigField(instanceId, "edge_transports.internal", {
		edges: edges
	});

	return {
		instanceId,
	}
}
