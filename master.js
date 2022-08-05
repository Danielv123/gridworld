"use strict";
const fs = require("fs-extra");
const path = require("path");

const { libLink, libPlugin, libErrors } = require("@clusterio/lib");
const registerTileServer = require("./src/routes/tileserver");

const getMapDataRequestHandler = require("./src/request_handlers/getMapDataRequestHandler");
const createRequestHandler = require("./src/request_handlers/createRequestHandler");
const refreshTileDataRequestHandler = require("./src/request_handlers/refreshTileDataRequestHandler");
const setPlayerPositionSubscriptionRequestHandler = require("./src/request_handlers/setPlayerPositionSubscriptionRequestHandler");
const startInstanceRequestHandler = require("./src/request_handlers/startInstanceRequestHandler");
const createFactionRequestHandler = require("./src/request_handlers/createFactionRequestHandler");
const updateFactionRequestHandler = require("./src/request_handlers/updateFactionRequestHandler");
const migrateInstanceCommandRequestHandler = require("./src/instance_migration/migrateInstanceCommandRequestHandler");

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

	migrateInstanceCommandRequestHandler = migrateInstanceCommandRequestHandler;

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
