/**
 * @module
 */
"use strict";
const libErrors = require("@clusterio/lib/errors");
const libPlugin = require("@clusterio/lib/plugin");
const libLuaTools = require("@clusterio/lib/lua_tools");

class InstancePlugin extends libPlugin.BaseInstancePlugin {
	async init() {
		this.pendingTasks = new Set();
		this.disconnecting = false;
	}

	async onStart() {
		let data = {
			x_size: this.instance.config.get("gridworld.grid_x_size"),
			y_size: this.instance.config.get("gridworld.grid_y_size"),
			world_x : this.instance.config.get("gridworld.grid_x_position"),
			world_y : this.instance.config.get("gridworld.grid_y_position"),
		}
		await this.sendRcon(`/c gridworld.create_spawn("${data.x_size}","${data.y_size}","${data.world_x}","${data.world_y}", false)`, true);
		await this.sendRcon(`/c gridworld.create_world_limit("${data.x_size}","${data.y_size}","${data.world_x}","${data.world_y}", false)`, true);
	}

	async onStop() {
		clearInterval(this.pingId);
		await Promise.all(this.pendingTasks);
	}

	onMasterConnectionEvent(event) {
		if (event === "drop" || event === "close") {
			this.sendRcon('/sc gridworld.populate_neighbor_data(nil, nil, nil, nil)').catch(
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
			(async () => {
				if (this.disconnecting) {
					return;
				}
			})().catch(
				err => this.logger.error(`Unexpected error:\n${err.stack}`)
			);
		}
	}

	async runTask(task) {
		this.pendingTasks.add(task);
		task.finally(() => { this.pendingTasks.delete(task); });
		return task
	}

	async populateNeighborDataRequestHandler(message) {
		if (this.instance.status !== "running") {
			return;
		}
		let { north, south, east, west} = message.data;

		// Update neighboring nodes for edge_teleports
		return this.runTask(this.sendRcon(`/c gridworld.populate_neighbor_data(${north || "nil"}, ${south || "nil"}, ${east || "nil"}, ${west || "nil"})`))
	}
}

module.exports = {
	InstancePlugin,
};
