/**
 * @module
 */
"use strict";
const libPlugin = require("@clusterio/lib/plugin");
const libLuaTools = require("@clusterio/lib/lua_tools");
const { libLink } = require("@clusterio/lib");

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
		this.instance.server.on("ipc-gridworld:start_server", data => {
			this.startServer(data).catch(err => this.logger.error(
				`Error handling player teleport:\n${err.stack}`
			));
		});
		this.instance.server.on("ipc-gridworld:create_faction", data => {
			this.createFaction(data).catch(err => this.logger.error(
				`Error creating faction:\n${err.stack}`
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
			await this.sendRcon(`/sc gridworld.create_world_limit("${data.x_size}","${data.y_size}","${data.world_x}","${data.world_y}", false)`, true);
			await this.sendRcon(`/sc gridworld.create_spawn("${data.x_size}","${data.y_size}","${data.world_x}","${data.world_y}", false)`, true);
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

	async startServer(data) {
		// Allow player to start server by moving to its edge
		await this.info.messages.startInstance.send(this.instance, {
			instance_id: data.instance_id,
			save: null,
		});

		// Ask player to teleport
		await this.sendRcon(`/sc gridworld.ask_for_teleport("${data.player_name}")`);
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
