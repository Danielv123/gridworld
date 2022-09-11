"use strict";
const createLobbyServer = require("../createLobbyServer");

module.exports = async function createFactionGrid({
	plugin,
	slaveId,
	x_size,
	y_size,
}) {
	// Create lobby server
	let lobbyInstance = await createLobbyServer(plugin, slaveId, x_size, y_size);
	let grid_id = lobbyInstance.config.get("gridworld.grid_id")
	return {
		grid_id,
	}
}
