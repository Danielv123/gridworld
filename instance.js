/**
 * @module
 */
"use strict";
const libPlugin = require("@clusterio/lib/plugin");
const libLuaTools = require("@clusterio/lib/lua_tools");
const { libLink } = require("@clusterio/lib");

const sleep = require("./src/util/sleep");

class InstancePlugin extends libPlugin.BaseInstancePlugin {
	async init() {
		this.pendingTasks = new Set();
		this.disconnecting = false;

		this.instance.server.on("ipc-gridworld:send_teleport_command", data => {
			this.teleportPlayer(data).catch(err => this.logger.error(
				`Error handling player teleport:\n${err.stack}`
			));
		});
		this.instance.server.on("ipc-gridworld:send_player_position", data => {
			this.sendPlayerPosition(data).catch(err => this.logger.error(
				`Error handling player teleport:\n${err.stack}`
			));
		});
		this.instance.server.on("ipc-gridworld:create_faction", data => {
			this.createFaction(data).catch(err => this.logger.error(
				`Error creating faction:\n${err.stack}`
			));
		});
		this.instance.server.on("ipc-gridworld:update_faction", data => {
			this.updateFaction(data).catch(err => this.logger.error(
				`Error updating faction:\n${err.stack}`
			));
		});
		this.instance.server.on("ipc-gridworld:claim_server", data => {
			this.claimServer(data).catch(err => this.logger.error(
				`Error claiming server:\n${err.stack}`
			));
		});
		this.instance.server.on("ipc-gridworld:unclaim_server", data => {
			this.unclaimServer(data).catch(err => this.logger.error(
				`Error unclaiming server:\n${err.stack}`
			));
		});
		this.instance.server.on("ipc-gridworld:join_gridworld", data => {
			this.joinGridworld(data).catch(err => this.logger.error(
				`Error joining gridworld:\n${err.stack}`
			));
		});
		this.instance.server.on("ipc-gridworld:perform_edge_teleport", data => {
			this.performEdgeTeleport(data).catch(err => this.logger.error(
				`Error performing edge teleport:\n${err.stack}`
			));
		});
	}

	async onStart() {
		let data = {
			x_size: this.instance.config.get("gridworld.grid_x_size"),
			y_size: this.instance.config.get("gridworld.grid_y_size"),
			world_x: this.instance.config.get("gridworld.grid_x_position"),
			world_y: this.instance.config.get("gridworld.grid_y_position"),
		};
		if (this.instance.config.get("gridworld.is_lobby_server")) {
			await this.sendRcon("/sc gridworld.register_lobby_server(true)");
			// Get gridworld data
			const { map_data } = await this.info.messages.getMapData.send(this.instance);
			await this.sendRcon(`/sc gridworld.register_map_data('${JSON.stringify(map_data)}')`);
		} else {
			await this.sendRcon("/sc global.disable_crashsite = true");
			await this.sendRcon(`/sc gridworld.create_world_limit("${data.x_size}","${data.y_size}","${data.world_x}","${data.world_y}", false)`, true);
			await this.sendRcon(`/sc gridworld.create_spawn("${data.x_size}","${data.y_size}","${data.world_x}","${data.world_y}", false)`, true);
			// Update neighboring nodes for edge_transports
			await sleep(1000);
			await this.info.messages.updateEdgeTransportEdges.send(this.instance, {
				instance_id: this.instance.id,
			});
			// Refresh faction data
			const response = await this.info.messages.refreshFactionData.send(this.instance);
			for (let faction of response.factions) {
				await this.runTask(this.sendRcon(`/sc gridworld.sync_faction("${faction.faction_id}",'${libLuaTools.escapeString(JSON.stringify(faction))}')`));
			}
		}
	}

	async onStop() {
		clearInterval(this.pingId);
		await Promise.all(this.pendingTasks);
	}

	onMasterConnectionEvent(event) {
		if (event === "drop" || event === "close") {
			this.sendRcon("/sc gridworld.populate_neighbor_data(nil, nil, nil, nil)").catch(
				err => this.logger(`Error deactivating neighbors:\n${err.stack}`)
			);
		}
	}

	onPrepareMasterDisconnect() {
		this.disconnecting = true;
	}

	onMasterConnectionEvent(event) {
		if (event === "connect") {
			this.disconnecting = false;
		}
	}

	async runTask(task) {
		this.pendingTasks.add(task);
		task.finally(() => { this.pendingTasks.delete(task); });
		return task;
	}

	async populateNeighborDataRequestHandler(message) {
		if (this.instance.status !== "running") {
			return;
		}
		let { north, south, east, west } = message.data;

		// Update neighboring nodes for edge_teleports
		await this.runTask(this.sendRcon(`/sc gridworld.populate_neighbor_data(${north || "nil"}, ${south || "nil"}, ${east || "nil"}, ${west || "nil"})`));
	}

	async teleportPlayer(data) {
		await this.info.messages.teleportPlayer.send(this.instance, {
			instance_id: data.instance_id,
			player_name: data.player_name,
			x: data.x,
			y: data.y,
		});
	}

	async teleportPlayerRequestHandler(message) {
		if (this.instance.status !== "running") {
			return;
		}

		await this.runTask(this.sendRcon(`/sc gridworld.receive_teleport_data("${libLuaTools.escapeString(JSON.stringify(message.data))}")`));
	}

	async sendPlayerPosition(data) {
		await this.info.messages.playerPosition.send(this.instance, {
			player_name: data.player_name,
			instance_id: data.instance_id,
			x: data.x,
			y: data.y,
		});
	}

	async createFaction(data) {
		const status = await this.info.messages.createFaction.send(this.instance, {
			faction_id: data.faction_id,
			name: data.name,
			open: data.open,
			members: [{
				name: data.owner,
				role: "leader",
			}],
			friends: [],
			enemies: [],
			instances: [],
			about: {
				header: `${data.name} description`,
				description: `${data.name} was started by ${data.owner} on ${new Date().toISOString()}`,
				rules: "The faction leader has not set any rules",
			},
		});
		if (status.ok) {
			// Sync faction with lobby world
			await this.sendRcon(`/sc gridworld.sync_faction("${data.faction_id}","${libLuaTools.escapeString(JSON.stringify(status.faction))}")`);
			// Open faction admin screen for owner
			await this.sendRcon(`/sc gridworld.open_faction_admin_screen("${data.owner}","${data.faction_id}")`);
		}
	}

	async updateFaction(data) {
		// Show received progress in game
		await this.sendRcon(`/sc gridworld.show_progress("${data.player_name}", "Saving faction", "Propagating changes", 2, 3)`);

		// Update master server
		const status = await this.info.messages.updateFaction.send(this.instance, {
			faction_id: data.faction_id,
			name: data.name,
			open: data.open,
			about: data.about,
		});
		// Show completed progress in game
		await this.sendRcon(`/sc gridworld.show_progress("${data.player_name}", "Saving faction", "Finishing", 3, 3)`);
		await new Promise(r => setTimeout(r, 500));
		// Navigate to updated faction screen
		await this.sendRcon(`/sc gridworld.open_faction_admin_screen("${data.player_name}","${data.faction_id}")`);
	}

	async claimServer(data) {
		// Show received progress in game
		await this.sendRcon(`/sc gridworld.show_progress("${data.player_name}", "Claiming server", "Propagating changes", 2, 3)`);
		// Update master
		const status = await this.info.messages.claimServer.send(this.instance, {
			instance_id: this.instance.config.get("instance.id"),
			player_name: data.player_name,
			faction_id: data.faction_id,
		});
		if (status.ok) {
			await this.sendRcon(`/sc gridworld.show_progress("${data.player_name}", "Claiming server", "Finishing", 3, 3)`);
			await this.sendRcon(`/sc gridworld.claim_server("${data.faction_id}")`);
			await new Promise(r => setTimeout(r, 500));
			await this.sendRcon(`/sc game.get_player("${data.player_name}").gui.center.clear()`);
		} else {
			await this.sendRcon(`/sc gridworld.show_progress("${data.player_name}", "Claiming server", "Failed", 3, 3)`);
			await this.sendRcon(`/sc game.get_player("${data.player_name}".print("Failed to claim server: ${status.msg}")`);
			this.logger.error(`Failed to claim server: ${status.msg}`);
		}
	}

	async unclaimServer(data) {
		// Show received progress in game
		await this.sendRcon(`/sc gridworld.show_progress("${data.player_name}", "Unclaiming server", "Propagating changes", 2, 3)`);
		// Update master
		const status = await this.info.messages.unclaimServer.send(this.instance, {
			instance_id: this.instance.config.get("instance.id"),
			player_name: data.player_name,
		});
		if (status.ok) {
			await this.sendRcon(`/sc gridworld.show_progress("${data.player_name}", "Unclaiming server", "Finishing", 3, 3)`);
			await this.sendRcon(`/sc gridworld.unclaim_server("${data.faction_id}")`);
			await new Promise(r => setTimeout(r, 500));
			await this.sendRcon(`/sc game.get_player("${data.player_name}").gui.center.clear()`);
		} else {
			await this.sendRcon(`/sc gridworld.show_progress("${data.player_name}", "Unclaiming server", "Failed", 3, 3)`);
			await this.sendRcon(`/sc game.get_player("${data.player_name}".print("Failed to unclaim server: ${status.msg}")`);
			this.logger.error(`Failed to unclaim server: ${status.msg}`);
		}
	}

	async factionUpdateEventHandler(message) {
		if (this.instance.status === "running") {
			// Update faction in game
			await this.runTask(this.sendRcon(`/sc gridworld.sync_faction("${message.data.faction.faction_id}",'${libLuaTools.escapeString(JSON.stringify(message.data.faction))}')`));
		}
	}

	async joinGridworld(data) {
		// Show received progress in game
		await this.sendRcon(`/sc gridworld.show_progress("${data.player_name}", "Finding server", "Loading world", 1, 3)`);

		let response = await this.info.messages.joinGridworld.send(this.instance, {
			player_name: data.player_name,
			grid_id: this.instance.config.get("gridworld.grid_id"),
		});

		// Show completed progress in game
		await this.sendRcon(`/sc gridworld.show_progress("${data.player_name}", "Joining gridworld", "${response.message}", 3, 3)`);
		await new Promise(r => setTimeout(r, 500));

		// Connect to new server
		const command = `/sc game.players["${data.player_name}"].connect_to_server({address="${response.connection_address}", name="${response.server_name}", description="${response.server_description}"})`;
		// this.logger.info(`Sending command to server: ${command}`);
		await this.sendRcon(command);
	}

	/**
	 * Triggered when a player walks to the edge of a server. Prepare the destination server and prompt for teleport.
	 * @param {object} data - Data sent by the game
	 * @param {string} data.player_name - Name of the player
	 * @param {number} data.player_x_position - X position of the player
	 * @param {number} data.player_y_position - Y position of the player
	 */
	async performEdgeTeleport(data) {
		const response = await this.info.messages.performEdgeTeleport.send(this.instance, {
			player_name: data.player_name,
			player_x_position: data.player_x_position,
			player_y_position: data.player_y_position,
			grid_id: this.instance.config.get("gridworld.grid_id"),
		});

		if (response.ok) {
			// Prepare server in case the player accepts the teleport
			let teleport_data = {
				player_name: data.player_name,
				instance_id: response.instance_id,
				x: data.player_x_position,
				y: data.player_y_position,
			};
			await this.sendRcon(`/sc gridworld.prepare_teleport_data('${JSON.stringify(teleport_data)}')`);
			// Ask player to connect to new server
			const command = `/sc game.players["${data.player_name}"].connect_to_server({address="${response.connection_address}", name="${response.server_name}", description="${response.server_description}"})`;
			// this.logger.info(`Sending command to server: ${command}`);
			await this.sendRcon(command);
		} else {
			await this.sendRcon(`/sc game.print("Failed to teleport: ${response.message}")`);
			this.logger.error(`Failed to teleport: ${response.message}`);
		}
	}

	async getTileDataRequestHandler(message) {
		if (this.instance.status !== "running") {
			throw new libErrors.RequestError(`Instance with ID ${message.data.instance_id} is not running ${this.instance.status}`);
		}
		let { position_a, position_b } = message.data;
		let response = await this.sendRcon(`/sc gridworld.dump_mapview({${position_a}}, {${position_b}})`);
		// let tileData = JSON.parse(response);
		let tileData = response.split(";");
		if (!Array.isArray(tileData)) { tileData = []; }

		return {
			tile_data: tileData,
		};
	}
}

module.exports = {
	InstancePlugin,
};
