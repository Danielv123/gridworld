"use strict";

const assignInstance = require("../assignInstance");
const createInstance = require("../createInstance");
const createSave = require("../createSave");
const getEdges = require("../getEdges");
const packagejson = require("../../../package.json");
const mapFind = require("../../util/mapFind");
const mapFilter = require("../../util/mapFilter");

module.exports = async function createServer({
	plugin,
	hostId,
	x,
	y,
	grid_id,
}) {
	// Get x_size and y_size from lobby server
	const lobby_server = mapFind(plugin.controller.instances, instance => instance.config.get("gridworld.grid_id") === grid_id
		&& instance.config.get("gridworld.is_lobby_server")
	);
	const x_size = lobby_server.config.get("gridworld.grid_x_size");
	const y_size = lobby_server.config.get("gridworld.grid_y_size");

	// Find host with free capacity
	if (hostId === undefined) {
		// Get hosts with gridworld installed
		const hosts = mapFilter(plugin.controller.hosts, host => host.plugins.get("gridworld") === packagejson.version);
		const outdatedHosts = mapFilter(plugin.controller.hosts, host => host.plugins.get("gridworld") !== packagejson.version);
		if (outdatedHosts.length > 0) {
			plugin.logger.warn(`Found ${outdatedHosts.length} hosts with outdated gridworld plugin, please update them: ${outdatedHosts.map(host => host.name).join(", ")}`);
		}
		// Get host with lowest load
		const instances = mapFilter(plugin.controller.instances, instance => instance.config.get("instance.assigned_host") !== undefined);
		const hostLoads = [...hosts].map(([_, host]) => ({
			hostId: host.id,
			load: mapFilter(instances, instance => instance.config.get("instance.assigned_host") === host.id).length,
		}));
		hostId = hostLoads.sort((a, b) => a.load - b.load)[0].hostId;
	}

	// Create instance
	const instanceId = await createInstance(plugin, `Grid square ${Math.floor(Math.random() * 2 ** 16).toString()}`, x, y, x_size, y_size, grid_id);

	// Assign instance to host
	await assignInstance(plugin, instanceId, hostId);

	// Create savefile
	await createSave(
		plugin,
		instanceId,
		plugin.controller.config.get("gridworld.gridworld_seed"),
		plugin.controller.config.get("gridworld.gridworld_map_exchange_string")
	);

	return {
		instanceId,
	};
};
