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

	async onStop() {
		clearInterval(this.pingId);
		await Promise.all(this.pendingTasks);
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

	async setupWorldRequestHandler(message) {
		if (this.instance.status !== "running") {
			return;
		}
		let data = message.data;

		let task = this.sendRcon(`/c gridworld.create_spawn("${data.x_size}","${data.y_size}","${data.world_x}","${data.world_y}")`, true);
		let task2 = this.sendRcon(`/c gridworld.create_world_limit("${data.x_size}","${data.y_size}","${data.world_x}","${data.world_y}")`, true);
		this.pendingTasks.add(task);
		this.pendingTasks.add(task2);
		task.finally(() => { this.pendingTasks.delete(task); });
		task2.finally(() => { this.pendingTasks.delete(task2); });
		await task;
		await task2;
		return
	}
}

module.exports = {
	InstancePlugin,
};
