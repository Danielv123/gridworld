"use strict";
const lib = require("@clusterio/lib");
const mapFilter = require("../util/mapFilter");
const mapFind = require("../util/mapFind");

const createServer = require("../worldgen/factionGrid/createServer");
const worldPositionToInstance = require("../worldgen/util/worldPositionToInstance");

/**
 * Triggered when a player walks to the edge of a server. Prepare the destination server and prompt for teleport.
 * @param {object} message - The message object
 * @param {object} message.data - The message data
 * @param {string} message.data.player_name - The name of the player
 * @param {number} message.data.player_x_position - The x position of the player
 * @param {number} message.data.player_y_position - The y position of the player
 * @param {object} message.data.grid_id - The grid id of the originating instance
 */
module.exports = async function joinGridworldRequestHandler(message) {
	const player_name = message.data.player_name;

	// Get player profile from controller
	const player = this.controller.userManager.users.get(player_name);

	// Get player faction
	// TODO: Sync faction data to destination instance
	// const faction = mapFind(this.factionsDatastore, f => f.members.find(member => member.name.toLowerCase() === player_name.toLowerCase));

	// Get the destination instance
	const instance_specification = worldPositionToInstance(
		message.data.player_x_position,
		message.data.player_y_position,
		message.data.grid_id,
		this.controller.instances
	);

	let instance_to_connect_to = null;

	const response = {
		ok: false,
		message: "Server not found",
	};

	if (!instance_specification.instance) {
		try {
			player.checkPermission("gridworld.map.create_by_exploration");
		} catch (e) {
			return {
				ok: false,
				message: "You do not have permission to create new servers through exploration",
			};
		}
		// No instance found for factionless spawn, create a new one
		const instance_id = (await createServer({
			plugin: this,
			x: instance_specification.grid_x_position,
			y: instance_specification.grid_y_position,
			grid_id: message.data.grid_id,
		})).instanceId;
		const instance = this.controller.instances.get(instance_id);

		response.ok = true;
		response.message = "Created new instance";
		response.server_name = instance.config.get("instance.name");
		response.server_description = "Newly created world spawn";
		instance_to_connect_to = instance;
		this.logger.info(`Sending player ${player_name} to edge at newly created instance ${instance_to_connect_to.config.get("instance.id")}`);
	} else {
		// Instance found, join it
		response.ok = true;
		response.message = "Joining existing instance";
		response.server_name = instance_specification.instance.config.get("instance.name");
		response.server_description = "Existing instance";
		instance_to_connect_to = instance_specification.instance;
		this.logger.info(`Sending player ${player_name} to edge at existing instance ${instance_to_connect_to.config.get("instance.id")}`);
	}

	// Ensure the instance we are connecting to is started
	if (instance_to_connect_to) {
		const hostId = instance_to_connect_to.config.get("instance.assigned_host");
		let hostConnection = this.controller.wsServer.hostConnections.get(hostId);
		// Instance status
		if (instance_to_connect_to.status !== "running") {
			try {
				player.checkPermission("gridworld.map.start_by_exploration");
			} catch (e) {
				return {
					ok: false,
					message: "You do not have permission to start servers through exploration",
				};
			}
			// Start the instance
			await this.controller.sendTo(
				{ instanceId: instance_to_connect_to.config.get("instance.id") },
				new lib.InstanceStartRequest()
			);
		}

		const host = this.controller.hosts.get(hostId);
		response.connection_address = `${host.publicAddress}:${instance_to_connect_to.game_port || instance_to_connect_to.config.get("factorio.game_port")}`;
	}

	// Return response to client
	response.instance_id = instance_to_connect_to.config.get("instance.id");
	return response;
};
