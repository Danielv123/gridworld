"use strict";

const assignInstance = require("../assignInstance");
const createInstance = require("../createInstance");
const createSave = require("../createSave");
const getEdges = require("../getEdges");
const packagejson = require("../../../package.json");

const edge_target_position_offets = [
	{},
	[0, -1],
	[0, 1],
	[1, 0],
	[-1, 0],
];

module.exports = async function createServer({
	plugin,
	slaveId,
	x,
	y,
	grid_id,
}) {
	// Get x_size and y_size from lobby server
	const lobby_server = plugin.master.instances.find(instance => instance.config.get("gridworld.grid_id") === grid_id
		&& instance.config.get("gridworld.is_lobby_server"));
	const x_size = lobby_server.config.get("gridworld.x_size");
	const y_size = lobby_server.config.get("gridworld.y_size");

	// Create instance
	const instanceId = await createInstance(plugin, `Grid square ${Math.floor(Math.random() * 2 ** 16).toString()}`, x, y, x_size, y_size, grid_id);

	// Find slave with free capacity
	if (slaveId === undefined) {
		// Get slaves with gridworld installed
		const slaves = plugin.master.slaves.filter(slave => slave.plugins.gridworld === packagejson.version);
		const outdatedSlaves = plugin.master.slaves.filter(slave => slave.plugins.gridworld !== packagejson.version);
		if (outdatedSlaves.length > 0) {
			plugin.logger.warn(`Found ${outdatedSlaves.length} slaves with outdated gridworld plugin, please update them: ${outdatedSlaves.map(slave => slave.name).join(", ")}`);
		}
		// Get slave with lowest load
		const instances = plugin.master.instances.filter(instance => instance.slaveId !== undefined);
		const slaveLoads = slaves.map(slave => ({
			slaveId: slave.id,
			load: instances.filter(instance => instance.slaveId === slave.id).length,
		}));
		slaveId = slaveLoads.sort((a, b) => a.load - b.load)[0].slaveId;
	}

	// Assign instance to slave
	await assignInstance(plugin, instanceId, slaveId);

	// Create savefile
	await createSave(
		plugin,
		instanceId,
		plugin.master.config.get("gridworld.gridworld_seed"),
		plugin.master.config.get("gridworld.gridworld_map_exchange_string")
	);

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
			y + edge_target_position_offets[edge.id][1],
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
				edge_transports_config.edges.find(e => e.id === edge.target_edge).target_instance = instanceId;
				plugin.setInstanceConfigField(edge.target_instance, "edge_transports.internal", edge_transports_config);
			}
		}
	}

	// Set config
	plugin.setInstanceConfigField(instanceId, "edge_transports.internal", {
		edges: edges,
	});

	return {
		instanceId,
	};
};
