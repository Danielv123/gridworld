"use strict";

const assignInstance = require("../assignInstance");
const createInstance = require("../createInstance");
const createSave = require("../createSave");
const getEdges = require("../getEdges");
const packagejson = require("../../../package.json");
const mapFind = require("../../util/mapFind");
const mapFilter = require("../../util/mapFilter");
const slaveGetNextFreePort = require("../../util/slaveGetNextFreePort");

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
	const lobby_server = mapFind(plugin.master.instances, instance => instance.config.get("gridworld.grid_id") === grid_id
		&& instance.config.get("gridworld.is_lobby_server")
	);
	const x_size = lobby_server.config.get("gridworld.grid_x_size");
	const y_size = lobby_server.config.get("gridworld.grid_y_size");

	// Find slave with free capacity
	if (slaveId === undefined) {
		// Get slaves with gridworld installed
		const slaves = mapFilter(plugin.master.slaves, slave => slave.plugins.gridworld === packagejson.version);
		const outdatedSlaves = mapFilter(plugin.master.slaves, slave => slave.plugins.gridworld !== packagejson.version);
		if (outdatedSlaves.length > 0) {
			plugin.logger.warn(`Found ${outdatedSlaves.length} slaves with outdated gridworld plugin, please update them: ${outdatedSlaves.map(slave => slave.name).join(", ")}`);
		}
		// Get slave with lowest load
		const instances = mapFilter(plugin.master.instances, instance => instance.config.get("instance.assigned_slave") !== undefined);
		const slaveLoads = [...slaves].map(([_, slave]) => ({
			slaveId: slave.id,
			load: mapFilter(instances, instance => instance.config.get("instance.assigned_slave") === slave.id).length,
		}));
		slaveId = slaveLoads.sort((a, b) => a.load - b.load)[0].slaveId;
	}

	// Create instance
	const instance_game_port = slaveGetNextFreePort(plugin.master, slaveId);
	const instanceId = await createInstance(plugin, `Grid square ${Math.floor(Math.random() * 2 ** 16).toString()}`, x, y, x_size, y_size, grid_id, instance_game_port);

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
	const edges = getEdges({
		x_size,
		y_size,
		x,
		y,
		instances: plugin.master.instances,
	});

	// Find neighboring instances and update edge target instance ID
	for (const edge of edges) {
		const target_position = [
			x + edge_target_position_offets[edge.id][0],
			y + edge_target_position_offets[edge.id][1],
		];
		for (const instance of plugin.master.instances) {
			if (
				instance[1].config.get("gridworld.grid_id") === grid_id
				&& instance[1].config.get("gridworld.grid_x_position") === target_position[0]
				&& instance[1].config.get("gridworld.grid_y_position") === target_position[1]
			) {
				// Update local instance edge configuration
				edge.target_instance = instance[1].config.get("instance.id");
				// Update target instance edge configuration
				const edge_transports_config = instance[1].config.get("edge_transports.internal");
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
