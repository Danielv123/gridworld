"use strict";
const createLobbyServer = require("../createLobbyServer");

module.exports = async function createFactionGrid({
	plugin,
	slaveId,
}) {
	// Create lobby server
	let lobbyInstance = await createLobbyServer(plugin, slaveId);
	let grid_id = lobbyInstance.config.get("gridworld.grid_id")
	return {
		grid_id,
	}
}
