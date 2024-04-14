/**
 * @module
 */
"use strict";
const lib = require("@clusterio/lib");
// eslint-disable-next-line node/no-extraneous-require
const { BaseInstancePlugin } = require("@clusterio/host");

const sleep = require("./src/util/sleep");
const messages = require("./messages");
const tileDataIpcHandler = require("./src/mapview/tileDataIpcHandler");

class InstancePlugin extends BaseInstancePlugin {
	async init() {
		if (!this.instance.config.get("factorio.enable_save_patching")) {
			throw new Error("gridworld plugin requires save patching.");
		}

		this.pendingTasks = new Set();
		this.disconnecting = false;

		this.instance.server.on("ipc-gridworld:send_teleport_command", data => {
			this.teleportPlayer(data).catch(err => this.logger.error(
				`Error handling player teleport:\n${err}`
			));
		});
		this.instance.server.on("ipc-gridworld:send_player_position", data => {
			this.sendPlayerPosition(data).catch(err => this.logger.error(
				`Error handling sending player position:\n${err}`
			));
		});
		this.instance.server.on("ipc-gridworld:create_faction", data => {
			this.createFaction(data).catch(err => this.logger.error(
				`Error creating faction:\n${err}`
			));
		});
		this.instance.server.on("ipc-gridworld:update_faction", data => {
			this.updateFaction(data).catch(err => this.logger.error(
				`Error updating faction:\n${err}`
			));
		});
		this.instance.server.on("ipc-gridworld:faction_invite_player", data => {
			this.factionInvitePlayer(data).catch(err => this.logger.error(
				`Error inviting player to faction:\n${err}`
			));
		});
		this.instance.server.on("ipc-gridworld:join_faction", data => {
			this.joinFaction(data).catch(err => this.logger.error(
				`Error joining faction:\n${err}`
			));
		});
		this.instance.server.on("ipc-gridworld:faction_kick_player", data => {
			this.factionKickPlayer(data).catch(err => this.logger.error(
				`Error kicking player from faction:\n${err}`
			));
		});
		this.instance.server.on("ipc-gridworld:faction_change_member_role", data => {
			this.factionChangeMemberRole(data).catch(err => this.logger.error(
				`Error changing player role in faction:\n${err}`
			));
		});
		this.instance.server.on("ipc-gridworld:claim_server", data => {
			this.claimServer(data).catch(err => this.logger.error(
				`Error claiming server:\n${err}`
			));
		});
		this.instance.server.on("ipc-gridworld:unclaim_server", data => {
			this.unclaimServer(data).catch(err => this.logger.error(
				`Error unclaiming server:\n${err}`
			));
		});
		this.instance.server.on("ipc-gridworld:join_gridworld", data => {
			this.joinGridworld(data).catch(err => this.logger.error(
				`Error joining gridworld:\n${err}`
			));
		});
		this.instance.server.on("ipc-gridworld:perform_edge_teleport", data => {
			this.performEdgeTeleport(data).catch(err => this.logger.error(
				`Error performing edge teleport:\n${err}`
			));
		});
		this.instance.server.on("ipc-gridworld:load_balancing", data => {
			this.loadBalancing(data).catch(err => this.logger.error(
				`Error performing load balancing:\n${err}`
			));
		});
		this.instance.server.on("ipc-gridworld:tile_data", data => {
			tileDataIpcHandler(this, data).catch(err => this.logger.error(
				`Error handling tile data:´n${err}`
			));
		});

		// Register message handlers
		this.instance.handle(messages.PopulateNeighborData, this.populateNeighborDataRequestHandler.bind(this));
		this.instance.handle(messages.TeleportPlayer, this.teleportPlayerRequestHandler.bind(this));
		this.instance.handle(messages.FactionUpdate, this.factionUpdateEventHandler.bind(this));
		this.instance.handle(messages.GetTileData, this.getTileDataRequestHandler.bind(this));
	}

	async onStart() {
		let data = {
			x_size: this.instance.config.get("gridworld.grid_x_size"),
			y_size: this.instance.config.get("gridworld.grid_y_size"),
			world_x: this.instance.config.get("gridworld.grid_x_position"),
			world_y: this.instance.config.get("gridworld.grid_y_position"),
		};
		await this.sendRcon("/sc gridworld.is_server_unsafe_desync = true");
		if (this.instance.config.get("gridworld.is_lobby_server")) {
			await this.sendRcon("/sc gridworld.register_lobby_server(true)");
			// Get gridworld data
			const { map_data } = await this.instance.sendTo("controller", new messages.GetMapData());
			await this.sendRcon(`/sc gridworld.register_map_data('${JSON.stringify(map_data)}')`);
		} else {
			await this.sendRcon("/sc global.disable_crashsite = true");
			await this.sendRcon(`/sc gridworld.create_world_limit("${data.x_size}","${data.y_size}","${data.world_x}","${data.world_y}", false)`, true);
			await this.sendRcon(`/sc gridworld.create_spawn("${data.x_size}","${data.y_size}","${data.world_x}","${data.world_y}", false)`, true);
			// Update neighboring nodes for edge_transports
			await sleep(1000);
			await this.instance.sendTo("controller", new messages.UpdateEdgeTransportEdges({
				instance_id: this.instance.config.get("instance.id"),
			}));
			// Refresh faction data
			const response = await this.instance.sendTo("controller", new messages.RefreshFactionData());
			for (let faction of response.factions) {
				await this.runTask(this.sendRcon(`/sc gridworld.sync_faction("${faction.faction_id}",'${lib.escapeString(JSON.stringify(faction))}')`));
			}
			// Update map (should not be ran always)
			await sleep(1000);
			const x = data.world_x * data.x_size;
			const y = data.world_y * data.y_size;
			await this.sendRcon(`/sc gridworld.map.dump_mapview({${x - data.x_size},${y - data.y_size}}, {${x},${y}})`);
			await this.sendRcon(`/sc gridworld.map.dump_entities(game.surfaces[1].find_entities_filtered{area = {{${x - data.x_size},${y - data.y_size}}, {${x},${y}}}})`);
		}
	}

	async onStop() {
		clearInterval(this.pingId);
		await Promise.all(this.pendingTasks);
	}

	onControllerConnectionEvent(event) {
		if (event === "drop" || event === "close") {
			this.sendRcon("/sc gridworld.populate_neighbor_data(nil, nil, nil, nil)").catch(
				err => this.logger(`Error deactivating neighbors:\n${err}`)
			);
		}
	}

	onPrepareControllerDisconnect() {
		this.disconnecting = true;
	}

	onControllerConnectionEvent(event) {
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
		await this.instance.sendTo({ instanceId: data.instance_id }, new messages.TeleportPlayer({
			player_name: data.player_name,
			x: data.x,
			y: data.y,
		}));
	}

	async teleportPlayerRequestHandler(message) {
		if (this.instance.status !== "running") {
			return;
		}

		await this.runTask(this.sendRcon(`/sc gridworld.receive_teleport_data("${lib.escapeString(JSON.stringify(message.data))}")`));
	}

	async sendPlayerPosition(data) {
		if (this.host.connector.connected) {
			await this.instance.sendTo("controller", new messages.PlayerPosition({
				player_name: data.player_name,
				instance_id: data.instance_id,
				x: data.x,
				y: data.y,
			}));
		}
	}

	async createFaction(data) {
		const status = await this.instance.sendTo("controller", new messages.CreateFactionGrid({
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
		}));
		if (status.ok) {
			// Sync faction with lobby world
			await this.sendRcon(`/sc gridworld.sync_faction("${data.faction_id}","${lib.escapeString(JSON.stringify(status.faction))}")`);
			// Open faction admin screen for owner
			await this.sendRcon(`/sc gridworld.open_faction_admin_screen("${data.owner}","${data.faction_id}")`);
		}
	}

	async updateFaction(data) {
		// Show received progress in game
		await this.sendRcon(`/sc gridworld.show_progress("${data.player_name}", "Saving faction", "Propagating changes", 2, 3)`);

		// Update controller server
		const status = await this.instance.sendTo("controller", new messages.UpdateFaction({
			faction_id: data.faction_id,
			name: data.name,
			open: data.open,
			about: data.about,
		}));
		// Show completed progress in game
		await this.sendRcon(`/sc gridworld.show_progress("${data.player_name}", "Saving faction", "Finishing", 3, 3)`);
		await new Promise(r => setTimeout(r, 500));
		// Navigate to updated faction screen
		await this.sendRcon(`/sc gridworld.open_faction_admin_screen("${data.player_name}","${data.faction_id}")`);
	}

	async factionInvitePlayer(data) {
		let response = await this.instance.sendTo("controller", new messages.FactionInvitePlayer({
			faction_id: data.faction_id,
			player_name: data.player_name,
			role: data.role,
		}));
		if (response.ok) {
			// Close invite player dialog
			await this.sendRcon(`/sc game.get_player("${data.requesting_player}").gui.center.gridworld_invite_player_dialog.destroy()`);
		} else {
			// Show error message
			await this.sendRcon(`/sc game.get_player("${data.requesting_player}").print("${response.message}")`);
		}
	}

	async joinFaction(data) {
		let response = await this.instance.sendTo("controller", new messages.JoinFaction({
			faction_id: data.faction_id,
			player_name: data.player_name,
		}));
		if (response.ok) {
			await this.sendRcon(`/sc game.get_player("${data.player_name}").print("${response.message}")`);
		} else {
			// Show error message
			await this.sendRcon(`/sc game.get_player("${data.player_name}").print("${response.message}")`);
		}
	}

	async factionKickPlayer(data) {
		const response = await this.instance.sendTo("controller", new messages.LeaveFaction({
			faction_id: data.faction_id,
			player_name: data.player_name,
		}));
		if (!response.ok) {
			// Show error message
			await this.sendRcon(`/sc game.get_player("${data.requesting_player}").print("${response.message}")`);
		}
	}

	async factionChangeMemberRole(data) {
		const response = await this.instance.sendTo("controller", new messages.FactionChangeMemberRole({
			faction_id: data.faction_id,
			player_name: data.player_name,
			role: data.role,
		}));
		if (!response.ok) {
			// Show error message
			await this.sendRcon(`/sc game.get_player("${data.requesting_player}").print("${response.message}")`);
		}
	}

	async claimServer(data) {
		// Show received progress in game
		await this.sendRcon(`/sc gridworld.show_progress("${data.player_name}", "Claiming server", "Propagating changes", 2, 3)`);
		// Update controller
		const status = await this.instance.sendTo("controller", new messages.ClaimServer({
			instance_id: this.instance.config.get("instance.id"),
			player_name: data.player_name,
			faction_id: data.faction_id,
		}));
		if (status.ok) {
			await this.sendRcon(`/sc gridworld.show_progress("${data.player_name}", "Claiming server", "Finishing", 3, 3)`);
			await this.sendRcon(`/sc gridworld.claim_server("${data.faction_id}")`);
			await new Promise(r => setTimeout(r, 500));
			await this.sendRcon(`/sc game.get_player("${data.player_name}").gui.center.clear()`);
		} else {
			await this.sendRcon(`/sc gridworld.show_progress("${data.player_name}", "Claiming server", "Failed", 3, 3)`);
			await this.sendRcon(`/sc game.get_player("${data.player_name}".print("Failed to claim server: ${status.message}")`);
			this.logger.error(`Failed to claim server: ${status.message}`);
		}
	}

	async unclaimServer(data) {
		// Show received progress in game
		await this.sendRcon(`/sc gridworld.show_progress("${data.player_name}", "Unclaiming server", "Propagating changes", 2, 3)`);
		// Update controller
		const status = await this.instance.sendTo("controller", new messages.UnclaimServer({
			instance_id: this.instance.config.get("instance.id"),
			player_name: data.player_name,
		}));
		if (status.ok) {
			await this.sendRcon(`/sc gridworld.show_progress("${data.player_name}", "Unclaiming server", "Finishing", 3, 3)`);
			await this.sendRcon(`/sc gridworld.unclaim_server("${data.faction_id}")`);
			await new Promise(r => setTimeout(r, 500));
			await this.sendRcon(`/sc game.get_player("${data.player_name}").gui.center.clear()`);
		} else {
			await this.sendRcon(`/sc gridworld.show_progress("${data.player_name}", "Unclaiming server", "Failed", 3, 3)`);
			await this.sendRcon(`/sc game.get_player("${data.player_name}".print("Failed to unclaim server: ${status.message}")`);
			this.logger.error(`Failed to unclaim server: ${status.message}`);
		}
	}

	async factionUpdateEventHandler(message) {
		if (this.instance.status === "running") {
			// Update faction in game
			await this.runTask(this.sendRcon(`/sc gridworld.sync_faction("${message.data.faction.faction_id}",'${lib.escapeString(JSON.stringify(message.data.faction))}')`));
		}
	}

	async joinGridworld(data) {
		// Show received progress in game
		await this.sendRcon(`/sc gridworld.show_progress("${data.player_name}", "Finding server", "Loading world", 1, 3)`);

		let response = await this.instance.sendTo("controller", new messages.JoinGridworld({
			player_name: data.player_name,
			grid_id: this.instance.config.get("gridworld.grid_id"),
		}));

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
		const response = await this.instance.sendTo("controller", new messages.PerformEdgeTeleport({
			player_name: data.player_name,
			player_x_position: data.player_x_position,
			player_y_position: data.player_y_position,
			grid_id: this.instance.config.get("gridworld.grid_id"),
		}));

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

	/**
	 * Receive data from the load_balancing lua module
	 * @param {object} data - Data sent by the game
	 * @param {string} data.action - Requested action from the ingame module
	 * @param {string} data.load_factor - Estimated load of the instance
	 */
	async loadBalancing(data) {
		switch (data.action) {
			case "stop_server":
				// console.log(this, this.instance.plugins, this.instance.server, this.instance.sendSaveListUpdate);
				await lib.invokeHook(this.instance.plugins, "onStop");
				await this.instance.server.stop();
				await this.instance.sendSaveListUpdate();
				break;
			default:
				this.logger.error(`Unknown load balancing action: ${data.action}`);
				break;
		}
		// Send load_factor to controller
		await this.instance.sendTo("controller", new messages.SetLoadFactor({
			instance_id: this.instance.config.get("instance.id"),
			load_factor: data.load_factor,
		}));
	}

	async getTileDataRequestHandler(message) {
		if (this.instance.status !== "running") {
			throw new lib.RequestError(`Instance with ID ${message.data.instance_id} is not running ${this.instance.status}`);
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
