"use strict";
const { libLink } = require("@clusterio/lib");
const mapFilter = require("../util/mapFilter");
const mapFind = require("../util/mapFind");

const createServer = require("../worldgen/factionGrid/createServer");
const worldPositionToInstance = require("../worldgen/util/worldPositionToInstance");

module.exports = async function joinGridworldRequestHandler(message, request, link) {
	const player_name = message.data.player_name;

	// Get player profile from master
	const player = this.master.userManager.users.get(player_name);

	// Get player faction
	const faction = mapFind(this.factionsDatastore, f => f.members.find(member => member.name === player_name));

	// Get all instances in the current grid
	const instances = mapFilter(this.master.instances, instance => instance.config.get("gridworld.grid_id") === message.data.grid_id);

	const response = {
		ok: false,
		message: "Server not found",
	};
	let instance_to_connect_to = null;

	let last_visited_instance;
	let last_visited_instance_time;
	for (let instance of instances) {
		const instance_id = instance[1].config.get("instance.id");
		const instance_stats = player.instanceStats.get(instance_id);
		if (instance_stats
			&& Math.max(instance_stats.lastJoinAt.getTime(), instance_stats.lastLeaveAt.getTime()) > (last_visited_instance_time || 0)
			&& instance[1].config.get("gridworld.is_lobby_server") !== true
		) {
			last_visited_instance = instance[1];
			last_visited_instance_time = Math.max(instance_stats.lastJoinAt.getTime(), instance_stats.lastLeaveAt.getTime());
		}
	}
	if (last_visited_instance) {
		// Join the last visited instance
		response.ok = true;
		response.message = "Joining last visited instance";
		response.server_name = last_visited_instance.config.get("instance.name");
		response.server_description = "Last visited instance";
		instance_to_connect_to = last_visited_instance;
		this.logger.info(`Sending player ${player_name} to last visited instance ${instance_to_connect_to.config.get("instance.id")}`);
	} else if (faction && 1 === 2) { // TODO: Add option to join faction server
		// If the player doesn't have a last known location, send them to their faction spawn

	} else {
		// If the player doesn't have a faction, send them to the factionless spawn
		// Factionless spawn is 25,25
		const position = worldPositionToInstance(25, 25, message.data.grid_id, this.master.instances);
		if (!position.instance) {
			// No instance found for factionless spawn, create a new one
			const instance_id = (await createServer({
				plugin: this,
				x: position.grid_x_position,
				y: position.grid_y_position,
				grid_id: message.data.grid_id,
			})).instanceId;
			const instance = this.master.instances.get(instance_id);

			response.ok = true;
			response.message = "Created new instance";
			response.server_name = instance.config.get("instance.name");
			response.server_description = "Newly created world spawn";
			instance_to_connect_to = instance;
			this.logger.info(`Sending player ${player_name} to newly created factionless spanwn at ${instance_to_connect_to.config.get("instance.id")}`);
		} else {
			// Instance found for factionless spawn, join it
			response.ok = true;
			response.message = "Joining factionless spawn";
			response.server_name = position.instance.config.get("instance.name");
			response.server_description = "Factionless spawn";
			instance_to_connect_to = position.instance;
			this.logger.info(`Sending player ${player_name} to factionless spanwn at ${instance_to_connect_to.config.get("instance.id")}`);
		}
	}

	// Ensure the instance we are connecting to is started
	if (instance_to_connect_to) {
		const slaveId = instance_to_connect_to.config.get("instance.assigned_slave");
		let slaveConnection = this.master.wsServer.slaveConnections.get(slaveId);
		// Instance status
		if (instance_to_connect_to.status !== "running") {
			await libLink.messages.startInstance.send(slaveConnection, {
				instance_id: instance_to_connect_to.config.get("instance.id"),
				save: null,
			});
		}

		const slave = this.master.slaves.get(slaveId);
		response.connection_address = `${slave.public_address}:${instance_to_connect_to.game_port || instance_to_connect_to.config.get("factorio.game_port")}`;
	}

	// Return response to client
	return response;
};
