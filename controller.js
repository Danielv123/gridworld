"use strict";
const fs = require("fs-extra");
const path = require("path");

const lib = require("@clusterio/lib");
// eslint-disable-next-line node/no-extraneous-require
const { BaseControllerPlugin } = require("@clusterio/controller");
const registerTileServer = require("./src/routes/tileserver");

// Messages
const messages = require("./messages");
const MigrateInstanceRequest = require("./src/instance_migration/info/MigrateInstanceRequest");

// Message handlers
const getMapDataRequestHandler = require("./src/request_handlers/getMapDataRequestHandler");
const refreshTileDataRequestHandler = require("./src/request_handlers/refreshTileDataRequestHandler");
const setWebSubscriptionRequestHandler = require("./src/request_handlers/setWebSubscriptionRequestHandler");
const createFactionRequestHandler = require("./src/request_handlers/createFactionRequestHandler");
const updateFactionRequestHandler = require("./src/request_handlers/updateFactionRequestHandler");
const migrateInstanceRequestHandler = require("./src/instance_migration/migrateInstanceRequestHandler");
const playerPositionEventHandler = require("./src/event_handlers/playerPositionEventHandler");
const createFactionGridRequestHandler = require("./src/request_handlers/createFactionGridRequestHandler");
const joinGridworldRequestHandler = require("./src/request_handlers/joinGridworldRequestHandler");
const performEdgeTeleportRequestHandler = require("./src/request_handlers/performEdgeTeleportRequestHandler");
const updateEdgeTransportEdgesRequestHandler = require("./src/request_handlers/updateEdgeTransportEdgesRequestHandler");
const refreshFactionDataRequestHandler = require("./src/request_handlers/refreshFactionDataRequestHandler");
const factionInvitePlayerRequestHandler = require("./src/request_handlers/factionInvitePlayerRequestHandler");
const joinFactionRequestHandler = require("./src/request_handlers/joinFactionRequestHandler");
const factionChangeMemberRoleRequestHandler = require("./src/request_handlers/factionChangeMemberRoleRequestHandler");
const leaveFactionRequestHandler = require("./src/request_handlers/leaveFactionRequestHandler");
const claimServerRequestHandler = require("./src/request_handlers/claimServerRequestHandler");
const unclaimServerRequestHandler = require("./src/request_handlers/unclaimServerRequestHandler");
const setLoadFactorEventHandler = require("./src/event_handlers/setLoadFactorEventHandler");
const tileDataEventHandler = require("./src/mapview/tileDataEventHandler");
const startMapMergeRequestHandler = require("./src/request_handlers/startMapMergeRequestHandler");

async function loadDatabase(config, filename, logger) {
	let itemsPath = path.resolve(config.get("controller.database_directory"), filename);
	logger.verbose(`Loading ${itemsPath}`);
	try {
		let content = await fs.readFile(itemsPath, "utf-8");
		if (content.length === 0) {
			return new Map();
		}
		return new Map(JSON.parse(content));
	} catch (err) {
		if (err.code === "ENOENT") {
			logger.verbose("Creating new gridworld database");
			return new Map();
		}
		throw err;
	}
}

async function saveDatabase(controllerConfig, datastore, filename, logger) {
	if (datastore) {
		let file = path.resolve(controllerConfig.get("controller.database_directory"), filename);
		logger.verbose(`writing ${file}`);
		let content = JSON.stringify(Array.from(datastore));
		await fs.outputFile(file, content);
	}
}

class ControllerPlugin extends BaseControllerPlugin {
	async init() {
		this.gridworldDatastore = await loadDatabase(this.controller.config, "gridworld.json", this.logger);
		this.factionsDatastore = await loadDatabase(this.controller.config, "factions.json", this.logger);
		// Reconstruct gridworld information by iterating over all instances and finding lobby servers
		for (let [instanceId, instance] of this.controller.instances) {
			if (instance.config.get("gridworld.is_lobby_server")) {
				this.gridworldDatastore.set(instance.config.get("gridworld.grid_id"), {
					lobby_server: instanceId,
					id: instance.config.get("gridworld.grid_id"),
					name_prefix: instance.config.get("gridworld.grid_name_prefix"),
					x_size: instance.config.get("gridworld.grid_x_size"),
					y_size: instance.config.get("gridworld.grid_y_size"),
					use_edge_transports: true, // TODO: This should not be hardcoded
				});
			}
		}
		// Filter out deleted gridworlds
		for (let [gridId, grid] of this.gridworldDatastore) {
			if (!grid.id || !this.controller.instances.has(grid.lobby_server)) {
				this.gridworldDatastore.delete(gridId);
			}
		}

		this.autosaveId = setInterval(() => {
			saveDatabase(this.controller.config, this.gridworldDatastore, "gridworld.json", this.logger).catch(err => {
				this.logger.error(`Unexpected error autosaving gridworld data:\n${err.stack}`);
			});
			saveDatabase(this.controller.config, this.factionsDatastore, "factions.json", this.logger).catch(err => {
				this.logger.error(`Unexpected error autosaving factions data:\n${err.stack}`);
			});
		}, this.controller.config.get("gridworld.autosave_interval") * 1000);

		// Prepare tiles folder
		this._tilesPath = path.resolve(
			this.controller.config.get("controller.database_directory"),
			this.controller.config.get("gridworld.tiles_directory")
		);
		await fs.ensureDir(this._tilesPath);

		await registerTileServer(this.controller.app, this._tilesPath);

		this.subscribedControlLinks = [];

		// Register event handlers to messages
		this.controller.handle(messages.PlayerPosition, playerPositionEventHandler.bind(this));
		this.controller.handle(messages.GetMapData, getMapDataRequestHandler.bind(this));
		this.controller.handle(messages.UpdateEdgeTransportEdges, updateEdgeTransportEdgesRequestHandler.bind(this));
		this.controller.handle(messages.CreateFactionGrid, createFactionGridRequestHandler.bind(this));
		this.controller.handle(messages.RefreshTileData, refreshTileDataRequestHandler.bind(this));
		this.controller.handle(messages.SetWebSubscription, setWebSubscriptionRequestHandler.bind(this));
		this.controller.handle(messages.CreateFaction, createFactionRequestHandler.bind(this));
		this.controller.handle(messages.UpdateFaction, updateFactionRequestHandler.bind(this));
		this.controller.handle(MigrateInstanceRequest, migrateInstanceRequestHandler.bind(this));
		this.controller.handle(messages.JoinGridworld, joinGridworldRequestHandler.bind(this));
		this.controller.handle(messages.PerformEdgeTeleport, performEdgeTeleportRequestHandler.bind(this));
		this.controller.handle(messages.RefreshFactionData, refreshFactionDataRequestHandler.bind(this));
		this.controller.handle(messages.FactionInvitePlayer, factionInvitePlayerRequestHandler.bind(this));
		this.controller.handle(messages.JoinFaction, joinFactionRequestHandler.bind(this));
		this.controller.handle(messages.FactionChangeMemberRole, factionChangeMemberRoleRequestHandler.bind(this));
		this.controller.handle(messages.LeaveFaction, leaveFactionRequestHandler.bind(this));
		this.controller.handle(messages.ClaimServer, claimServerRequestHandler.bind(this));
		this.controller.handle(messages.UnclaimServer, unclaimServerRequestHandler.bind(this));
		this.controller.handle(messages.SetLoadFactor, setLoadFactorEventHandler.bind(this));
		this.controller.handle(messages.TileData, tileDataEventHandler.bind(this));
		this.controller.handle(messages.StartMapMerge, startMapMergeRequestHandler.bind(this));
	}

	async onInstanceStatusChanged(instance) {
		if (instance.status === "running") {
			let instanceId = instance.config.get("instance.id");
			let x = instance.config.get("gridworld.grid_x_position");
			let y = instance.config.get("gridworld.grid_y_position");
			let instances = [...this.controller.instances];
			await this.controller.sendTo({ instanceId }, new messages.PopulateNeighborData({
				instance_id: instanceId,
				north: instances.find(z => z[1].config.get("gridworld.grid_x_position") === x
					&& z[1].config.get("gridworld.grid_y_position") === y - 1)?.[0] || null,
				south: instances.find(z => z[1].config.get("gridworld.grid_x_position") === x
					&& z[1].config.get("gridworld.grid_y_position") === y + 1)?.[0] || null,
				east: instances.find(z => z[1].config.get("gridworld.grid_x_position") === x + 1
					&& z[1].config.get("gridworld.grid_y_position") === y)?.[0] || null,
				west: instances.find(z => z[1].config.get("gridworld.grid_x_position") === x - 1
					&& z[1].config.get("gridworld.grid_y_position") === y)?.[0] || null,
			}));
		}
	}

	onControlConnectionEvent(connection, event) {
		if (event === "close") {
			let index = this.subscribedControlLinks.indexOf(sub => sub.link === connection);
			if (index !== -1) { this.subscribedControlLinks.splice(index, 1); }
		}
	}

	async onShutdown() {
		clearInterval(this.autosaveId);
		await saveDatabase(this.controller.config, this.gridworldDatastore, "gridworld.json", this.logger);
		await saveDatabase(this.controller.config, this.factionsDatastore, "factions.json", this.logger);
	}
}

module.exports = {
	ControllerPlugin,
};
