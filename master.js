"use strict";
const fs = require("fs-extra");
const path = require("path");

const { libConfig, libLink } = require("@clusterio/lib");
const libPlugin = require("@clusterio/lib/plugin");
const libErrors = require("@clusterio/lib/errors");
const loadMapSettings = require("./src/loadMapSettings");
const info = require("./info");

async function loadDatabase(config, logger) {
	let itemsPath = path.resolve(config.get("master.database_directory"), "gridworld.json");
	logger.verbose(`Loading ${itemsPath}`);
	try {
		let content = await fs.readFile(itemsPath);
		return new Map(JSON.parse(content));

	} catch (err) {
		if (err.code === "ENOENT") {
			logger.verbose("Creating new gridworld database");
			return new Map();
		}
		throw err;
	}
}

async function saveDatabase(masterConfig, gridworldDatastore, logger) {
	if (gridworldDatastore) {
		let file = path.resolve(masterConfig.get("master.database_directory"), "gridworld.json");
		logger.verbose(`writing ${file}`);
		let content = JSON.stringify(Array.from(gridworldDatastore));
		await fs.outputFile(file, content);
	}
}

class MasterPlugin extends libPlugin.BaseMasterPlugin {
	async init() {
		this.gridworldDatastore = await loadDatabase(this.master.config, this.logger);
		this.autosaveId = setInterval(() => {
			saveDatabase(this.master.config, this.gridworldDatastore, this.logger).catch(err => {
				this.logger.error(`Unexpected error autosaving gridworld data:\n${err.stack}`);
			});
		}, this.master.config.get("gridworld.autosave_interval") * 1000);
	}

	async onInstanceStatusChanged(instance) {
		if (instance.status === "running") {
			let instanceId = instance.config.get("instance.id");
			let slaveId = instance.config.get("instance.assigned_slave");
			let x = instance.config.get("gridworld.grid_x_position");
			let y = instance.config.get("gridworld.grid_y_position");
			let slaveConnection = this.master.wsServer.slaveConnections.get(slaveId);
			let instances = [...this.master.instances];
			await this.info.messages.populateNeighborData.send(slaveConnection, {
				instance_id: instanceId,
				north: instances.find(instance => instance[1].config.get("gridworld.grid_x_position") === x
					&& instance[1].config.get("gridworld.grid_y_position") === y - 1)?.[0] || null,
				south: instances.find(instance => instance[1].config.get("gridworld.grid_x_position") === x
					&& instance[1].config.get("gridworld.grid_y_position") === y + 1)?.[0] || null,
				east: instances.find(instance => instance[1].config.get("gridworld.grid_x_position") === x + 1
					&& instance[1].config.get("gridworld.grid_y_position") === y)?.[0] || null,
				west: instances.find(instance => instance[1].config.get("gridworld.grid_x_position") === x - 1
					&& instance[1].config.get("gridworld.grid_y_position") === y)?.[0] || null,
			});
		}
	}

	async getMapDataRequestHandler(message) {
		const instances = [...this.master.instances];
		return {
			map_data: instances.map(instance => ({
				instance_id: instance[1].config.get("instance.id"),
				center: [
					(instance[1].config.get("gridworld.grid_x_position") - 1) * instance[1].config.get("gridworld.grid_x_size") + instance[1].config.get("gridworld.grid_x_size") / 2,
					(instance[1].config.get("gridworld.grid_y_position") - 1) * instance[1].config.get("gridworld.grid_y_size") + instance[1].config.get("gridworld.grid_y_size") / 2,
				],
				bounds: [
					[ // Top left
						(instance[1].config.get("gridworld.grid_x_position") - 1) * instance[1].config.get("gridworld.grid_x_size"),
						(instance[1].config.get("gridworld.grid_y_position") - 1) * instance[1].config.get("gridworld.grid_y_size"),
					], [ // Bottom left
						(instance[1].config.get("gridworld.grid_x_position") - 1) * instance[1].config.get("gridworld.grid_x_size"),
						instance[1].config.get("gridworld.grid_y_position") * instance[1].config.get("gridworld.grid_y_size"),
					], [ // Bottom right
						instance[1].config.get("gridworld.grid_x_position") * instance[1].config.get("gridworld.grid_x_size"),
						instance[1].config.get("gridworld.grid_y_position") * instance[1].config.get("gridworld.grid_y_size"),
					], [ // Top right
						instance[1].config.get("gridworld.grid_x_position") * instance[1].config.get("gridworld.grid_x_size"),
						(instance[1].config.get("gridworld.grid_y_position") - 1) * instance[1].config.get("gridworld.grid_y_size"),
					],
				],
				edges: instance[1].config.get("edge_transports.internal").edges,
			})),
		};
	}

	async createRequestHandler(message) {
		// message.data === { name_prefix: "Gridworld", use_edge_transports: true, x_size: 500, y_size: 500, x_count: 2, y_count: 2, slave: slave_id }
		// Create a new gridworld.
		let instances = [];

		if (!message.data.use_edge_transports) { return; }
		try {
			for (let x = 1; x <= message.data.x_count; x++) {
				for (let y = 1; y <= message.data.y_count; y++) {
					// Create instance
					let instance = {
						instanceId: await this.createInstance(`${message.data.name_prefix} x${x} y${y}`, x, y, message.data.x_size, message.data.y_size),
						x,
						y,
						slaveId: message.data.slave,
					};
					// Assign instance to a slave (using first slave as a placeholder)
					await this.assignInstance(instance.instanceId, instance.slaveId);

					// Create map
					await this.createSave(instance.instanceId, this.master.config.get("gridworld.gridworld_seed"), this.master.config.get("gridworld.gridworld_map_exchange_string"));

					instances.push(instance);
				}
			}
			// Create edges and configure edge_transports
			for (let x = 1; x <= message.data.x_count; x++) {
				for (let y = 1; y <= message.data.y_count; y++) {
					if (message.data.use_edge_transports) {
						// Create edges and add to edge_transports settings
						let instanceTemplate = instances.find(instance => instance.x === x && instance.y === y);
						let field = "edge_transports.internal";
						let value = {
							edges: [],
						};

						// x positive is right
						// y positive is down

						let worldfactor_x = (x - 1) * message.data.x_size;
						let worldfactor_y = (y - 1) * message.data.y_size;

						// Edge indexes: 1 = north, 2 = east, 3 = south, 4 = west
						// Northern edge
						if (y > 1) {
							value.edges.push({
								id: 1,
								origin: [worldfactor_x, worldfactor_y],
								surface: 1,
								direction: 0, // East
								length: message.data.x_size,
								target_instance: instances.find(instance => instance.x === x && instance.y === y - 1).instanceId,
								target_edge: 3,
							});
						}
						// Southern edge
						if (y < message.data.y_count) {
							value.edges.push({
								id: 3,
								origin: [message.data.x_size + worldfactor_x, message.data.y_size + worldfactor_y],
								surface: 1,
								direction: 4, // West
								length: message.data.x_size,
								target_instance: instances.find(instance => instance.x === x && instance.y === y + 1).instanceId,
								target_edge: 1,
							});
						}
						// Eastern edge
						if (x < message.data.x_count) {
							value.edges.push({
								id: 2,
								origin: [message.data.x_size + worldfactor_x, worldfactor_y],
								surface: 1,
								direction: 2, // South
								length: message.data.y_size,
								target_instance: instances.find(instance => instance.x === x + 1 && instance.y === y).instanceId,
								target_edge: 4,
							});
						}
						// Western edge
						if (x > 1) {
							value.edges.push({
								id: 4,
								origin: [worldfactor_x, message.data.y_size + worldfactor_y],
								surface: 1,
								direction: 6, // North
								length: message.data.y_size,
								target_instance: instances.find(instance => instance.x === x - 1 && instance.y === y).instanceId,
								target_edge: 2,
							});
						}
						// Update instance with edges
						await this.setInstanceConfigField(instanceTemplate.instanceId, field, value);
					}
				}
			}
		} catch (e) {
			this.logger.error(e);
		}
	}

	async createInstance(name, x, y, x_size, y_size) {
		this.logger.info("Creating instance", name);
		let instanceConfig = new libConfig.InstanceConfig("master");
		await instanceConfig.init();
		instanceConfig.set("instance.name", name);
		instanceConfig.set("gridworld.grid_x_position", x);
		instanceConfig.set("gridworld.grid_y_position", y);
		instanceConfig.set("gridworld.grid_x_size", x_size);
		instanceConfig.set("gridworld.grid_y_size", y_size);

		let instanceId = instanceConfig.get("instance.id");
		if (this.master.instances.has(instanceId)) {
			throw new libErrors.RequestError(`Instance with ID ${instanceId} already exists`);
		}

		// Add common settings for the Factorio server
		let settings = {
			"name": `${this.master.config.get("master.name")} - ${name}`,
			"description": `Clusterio instance for ${this.master.config.get("master.name")}`,
			"tags": ["clusterio"],
			"max_players": 0,
			"visibility": { "public": true, "lan": true },
			"username": "",
			"token": "",
			"game_password": "",
			"require_user_verification": true,
			"max_upload_in_kilobytes_per_second": 0,
			"max_upload_slots": 5,
			"ignore_player_limit_for_returning_players": false,
			"allow_commands": "admins-only",
			"autosave_interval": 10,
			"autosave_slots": 5,
			"afk_autokick_interval": 0,
			"auto_pause": false,
			"only_admins_can_pause_the_game": true,
			"autosave_only_on_server": true,

			...instanceConfig.get("factorio.settings"),
		};
		instanceConfig.set("factorio.settings", settings);

		let instance = { config: instanceConfig, status: "unassigned" };
		this.master.instances.set(instanceId, instance);
		await libPlugin.invokeHook(this.master.plugins, "onInstanceStatusChanged", instance, null);
		this.master.addInstanceHooks(instance);
		return instanceConfig.get("instance.id");
	}

	async assignInstance(instance_id, slave_id) {
		// Code lifted from ControlConnection.js assignInstanceCommandRequestHandler()
		let instance = this.master.instances.get(instance_id);
		if (!instance) {
			throw new libErrors.RequestError(`Instance with ID ${instance_id} does not exist`);
		}

		// Check if target slave is connected
		let newSlaveConnection;
		if (slave_id !== null) {
			newSlaveConnection = this.master.wsServer.slaveConnections.get(slave_id);
			if (!newSlaveConnection) {
				// The case of the slave not getting the assign instance message
				// still have to be handled, so it's not a requirement that the
				// target slave be connected to the master while doing the
				// assignment, but it is IMHO a better user experience if this
				// is the case.
				throw new libErrors.RequestError("Target slave is not connected to the master server");
			}
		}

		// Unassign from currently assigned slave if it is connected.
		let currentAssignedSlave = instance.config.get("instance.assigned_slave");
		if (currentAssignedSlave !== null && slave_id !== currentAssignedSlave) {
			let oldSlaveConnection = this.master.wsServer.slaveConnections.get(currentAssignedSlave);
			if (oldSlaveConnection && !oldSlaveConnection.connector.closing) {
				await libLink.messages.unassignInstance.send(oldSlaveConnection, { instance_id });
			}
		}

		// Assign to target
		instance.config.set("instance.assigned_slave", slave_id);
		if (slave_id !== null) {
			await libLink.messages.assignInstance.send(newSlaveConnection, {
				instance_id,
				serialized_config: instance.config.serialize("slave"),
			});
		}
	}

	async createSave(instance_id, seed_orig, mapExchangeString) {
		let instance = this.master.instances.get(instance_id);
		let slave_id = instance.config.get("instance.assigned_slave");

		let { seed, mapGenSettings, mapSettings } = await loadMapSettings({
			seed: seed_orig,
			mapExchangeString,
		});

		let slaveConnection = this.master.wsServer.slaveConnections.get(slave_id);
		return await libLink.messages.createSave.send(slaveConnection, {
			instance_id,
			name: "Gridworld",
			seed,
			map_gen_settings: mapGenSettings,
			map_settings: mapSettings,
		});
	}

	async setInstanceConfigField(instanceId, field, value) {
		// Code lifted from ControlConnection.js setInstanceConfigFieldRequestHandler(message)
		let instance = this.master.instances.get(instanceId);
		if (!instance) {
			throw new libErrors.RequestError(`Instance with ID ${instanceId} does not exist`);
		}

		if (field === "instance.assigned_slave") {
			throw new libErrors.RequestError("instance.assigned_slave must be set through the assign-slave interface");
		}

		if (field === "instance.id") {
			// XXX is this worth implementing?  It's race condition galore.
			throw new libErrors.RequestError("Setting instance.id is not supported");
		}

		instance.config.set(field, value, "control");
		await this.updateInstanceConfig(instance);
	}

	async updateInstanceConfig(instance) {
		let slaveId = instance.config.get("instance.assigned_slave");
		if (slaveId) {
			let connection = this.master.wsServer.slaveConnections.get(slaveId);
			if (connection) {
				await libLink.messages.assignInstance.send(connection, {
					instance_id: instance.config.get("instance.id"),
					serialized_config: instance.config.serialize("slave"),
				});
			}
		}
	}

	async onShutdown() {
		clearInterval(this.autosaveId);
		await saveDatabase(this.master.config, this.gridworldDatastore, this.logger);
	}
}

let sleep = s => new Promise(r => setTimeout(r, s * 1000));
module.exports = {
	MasterPlugin,
};
