"use strict";
const fs = require("fs-extra");
const path = require("path");

const { libConfig, libLink } = require("@clusterio/lib");
const libPlugin = require("@clusterio/lib/plugin");
const libErrors = require("@clusterio/lib/errors");
const loadMapSettings = require("./src/loadMapSettings");
const registerTileServer = require("./src/routes/tileserver");

const getMapDataRequestHandler = require("./src/request_handlers/getMapDataRequestHandler");
const createRequestHandler = require("./src/request_handlers/createRequestHandler");
const refreshTileDataRequestHandler = require("./src/request_handlers/refreshTileDataRequestHandler");
const setPlayerPositionSubscriptionRequestHandler = require("./src/request_handlers/setPlayerPositionSubscriptionRequestHandler");
const startInstanceRequestHandler = require("./src/request_handlers/startInstanceRequestHandler");
const createFactionRequestHandler = require("./src/request_handlers/createFactionRequestHandler");
const updateFactionRequestHandler = require("./src/request_handlers/updateFactionRequestHandler");

const playerPositionEventHandler = require("./src/event_handlers/playerPositionEventHandler");

async function loadDatabase(config, filename, logger) {
	let itemsPath = path.resolve(config.get("master.database_directory"), filename);
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

async function saveDatabase(masterConfig, datastore, filename, logger) {
	if (datastore) {
		let file = path.resolve(masterConfig.get("master.database_directory"), filename);
		logger.verbose(`writing ${file}`);
		let content = JSON.stringify(Array.from(datastore));
		await fs.outputFile(file, content);
	}
}

class MasterPlugin extends libPlugin.BaseMasterPlugin {
	async init() {
		this.gridworldDatastore = await loadDatabase(this.master.config, "gridworld.json", this.logger);
		this.factionsDatastore = await loadDatabase(this.master.config, "factions.json", this.logger);
		this.autosaveId = setInterval(() => {
			saveDatabase(this.master.config, this.gridworldDatastore, "gridworld.json", this.logger).catch(err => {
				this.logger.error(`Unexpected error autosaving gridworld data:\n${err.stack}`);
			});
			saveDatabase(this.master.config, this.factionsDatastore, "factions.json", this.logger).catch(err => {
				this.logger.error(`Unexpected error autosaving factions data:\n${err.stack}`);
			});
		}, this.master.config.get("gridworld.autosave_interval") * 1000);

		// Prepare tiles folder
		this._tilesPath = path.resolve(
			this.master.config.get("master.database_directory"),
			this.master.config.get("gridworld.tiles_directory")
		);
		await fs.ensureDir(this._tilesPath);

		registerTileServer(this.master.app, this._tilesPath);

		this.subscribedControlLinks = new Set();
	}

	playerPositionEventHandler = playerPositionEventHandler;

	getMapDataRequestHandler = getMapDataRequestHandler;

	createRequestHandler = createRequestHandler;

	refreshTileDataRequestHandler = refreshTileDataRequestHandler;

	setPlayerPositionSubscriptionRequestHandler = setPlayerPositionSubscriptionRequestHandler;

	startInstanceRequestHandler = startInstanceRequestHandler;

	createFactionRequestHandler = createFactionRequestHandler;

	updateFactionRequestHandler = updateFactionRequestHandler;

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
				north: instances.find(z => z[1].config.get("gridworld.grid_x_position") === x
					&& z[1].config.get("gridworld.grid_y_position") === y - 1)?.[0] || null,
				south: instances.find(z => z[1].config.get("gridworld.grid_x_position") === x
					&& z[1].config.get("gridworld.grid_y_position") === y + 1)?.[0] || null,
				east: instances.find(z => z[1].config.get("gridworld.grid_x_position") === x + 1
					&& z[1].config.get("gridworld.grid_y_position") === y)?.[0] || null,
				west: instances.find(z => z[1].config.get("gridworld.grid_x_position") === x - 1
					&& z[1].config.get("gridworld.grid_y_position") === y)?.[0] || null,
			});
		}
	}

	_getEdges({
		message,
		worldfactor_x,
		worldfactor_y,
		x_size,
		y_size,
		x,
		y,
		instances,
	}) {
		let edges = [];
		// Edge indexes: 1 = north, 2 = east, 3 = south, 4 = west
		// Northern edge
		if (y > 1) {
			edges.push({
				id: 1,
				origin: [worldfactor_x, worldfactor_y],
				surface: 1,
				direction: 0, // East
				length: x_size,
				target_instance: instances.find(instance => instance.x === x && instance.y === y - 1).instanceId,
				target_edge: 3,
			});
		}
		// Southern edge
		if (y < message.data.y_count) {
			edges.push({
				id: 3,
				origin: [x_size + worldfactor_x, y_size + worldfactor_y],
				surface: 1,
				direction: 4, // West
				length: x_size,
				target_instance: instances.find(instance => instance.x === x && instance.y === y + 1).instanceId,
				target_edge: 1,
			});
		}
		// Eastern edge
		if (x < message.data.x_count) {
			edges.push({
				id: 2,
				origin: [x_size + worldfactor_x, worldfactor_y],
				surface: 1,
				direction: 2, // South
				length: y_size,
				target_instance: instances.find(instance => instance.x === x + 1 && instance.y === y).instanceId,
				target_edge: 4,
			});
		}
		// Western edge
		if (x > 1) {
			edges.push({
				id: 4,
				origin: [worldfactor_x, y_size + worldfactor_y],
				surface: 1,
				direction: 6, // North
				length: y_size,
				target_instance: instances.find(instance => instance.x === x - 1 && instance.y === y).instanceId,
				target_edge: 2,
			});
		}
		return edges;
	}

	async createLobbyServer(slaveId) {
		// Create instance
		this.logger.info("Creating lobby server");
		const name = "Gridworld lobby server";
		let instanceConfig = new libConfig.InstanceConfig("master");
		await instanceConfig.init();
		instanceConfig.set("instance.name", name);
		instanceConfig.set("instance.auto_start", true);
		instanceConfig.set("gridworld.is_lobby_server", true);
		instanceConfig.set("gridworld.grid_id", Math.ceil(Math.random() * 1000));

		let instanceId = instanceConfig.get("instance.id");
		if (this.master.instances.has(instanceId)) {
			throw new libErrors.RequestError(`Instance with ID ${instanceId} already exists`);
		}

		// Add common settings for the Factorio server
		let settings = {
			...instanceConfig.get("factorio.settings"),

			"name": `${this.master.config.get("master.name")} - ${name}`,
			"description": `Clusterio instance for ${this.master.config.get("master.name")}`,
			"tags": ["clusterio", "gridworld"],
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
			"autosave_slots": 1,
			"afk_autokick_interval": 0,
			"auto_pause": false,
			"only_admins_can_pause_the_game": true,
			"autosave_only_on_server": true,
		};
		instanceConfig.set("factorio.settings", settings);

		let instance = { config: instanceConfig, status: "unassigned" };
		this.master.instances.set(instanceId, instance);
		await libPlugin.invokeHook(this.master.plugins, "onInstanceStatusChanged", instance, null);
		this.master.addInstanceHooks(instance);
		const instance_id = instanceConfig.get("instance.id");
		// Assign instance to a slave (using first slave as a placeholder)
		await this.assignInstance(instance_id, slaveId);

		// Create map
		await this.createSave(
			instance_id,
			this.master.config.get("gridworld.gridworld_seed"),
			this.master.config.get("gridworld.gridworld_map_exchange_string")
		);
		return instance;
	}

	async createInstance(name, x, y, x_size, y_size, grid_id) {
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
			...instanceConfig.get("factorio.settings"),

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


	onControlConnectionEvent(connection, event) {
		if (event === "close") {
			this.subscribedControlLinks.delete(connection);
		}
	}

	async onShutdown() {
		clearInterval(this.autosaveId);
		await saveDatabase(this.master.config, this.gridworldDatastore, this.logger);
	}
}

module.exports = {
	MasterPlugin,
};
