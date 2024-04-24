"use strict";
const path = require("path");
const fs = require("fs-extra");
const sharp = require("sharp");

const lib = require("@clusterio/lib");

const assignInstance = require("../worldgen/assignInstance");
const createSave = require("../worldgen/createSave");
const { InstanceInfo } = require("@clusterio/controller");
const mapFilter = require("../util/mapFilter");
const { TILE_SIZE } = require("../mapview/constants");

module.exports = async function startMapMergeRequestHandler(message) {
	// message === {
	// grid_id: "grid_id",
	// host_id: "host_id",
	// }

	// Create a new instance on the target host
	const name = `Map Merge ${message.grid_id}`;
	this.logger.info(`Creating instance for map merging ${name}`);
	let instanceConfig = new lib.InstanceConfig("controller");
	instanceConfig.set("instance.name", name);

	let instanceId = instanceConfig.get("instance.id");
	if (this.controller.instances.has(instanceId)) {
		throw new lib.RequestError(`Instance with ID ${instanceId} already exists`);
	}

	// Add common settings for the Factorio server
	let settings = {
		...instanceConfig.get("factorio.settings"),

		"name": `${this.controller.config.get("controller.name")} - ${name}`,
		"description": `Clusterio instance for ${this.controller.config.get("controller.name")}`,
		"tags": ["clusterio", "gridworld"],
		"visibility": { "public": true, "lan": true },
		"require_user_verification": true,
		"auto_pause": false,
	};
	instanceConfig.set("factorio.settings", settings);

	const mergeTargetInstance = new InstanceInfo(instanceConfig, "unassigned", undefined, Date.now());
	this.controller.instances.set(instanceId, mergeTargetInstance);
	await lib.invokeHook(this.controller.plugins, "onInstanceStatusChanged", mergeTargetInstance, null);
	this.controller.addInstanceHooks(mergeTargetInstance);

	// Assign instance to a host
	await assignInstance(this, instanceId, message.host_id);

	// Create savefile
	await createSave(
		this,
		instanceId,
		this.controller.config.get("gridworld.gridworld_seed"),
		this.controller.config.get("gridworld.gridworld_map_exchange_string")
	);

	// Start instance
	await this.controller.sendTo({ instanceId }, new lib.InstanceStartRequest());

	// Get instances with the same grid_id
	const instances = mapFilter(this.controller.instances,
		instance => instance.config.get("gridworld.grid_id") === message.grid_id
			&& instance.config.get("gridworld.is_grid_square") === true
	);
	for (let [_, instance] of instances) {
		// Generate chunks in target area on merge target
		const grid_x_size = instance.config.get("gridworld.grid_x_size");
		const grid_y_size = instance.config.get("gridworld.grid_y_size");
		const grid_x_position = instance.config.get("gridworld.grid_x_position");
		const grid_y_position = instance.config.get("gridworld.grid_y_position");
		const leftTop = [grid_x_position * grid_x_size, grid_y_position * grid_y_size];
		const rightBottom = [(grid_x_position + 1) * grid_x_size, (grid_y_position + 1) * grid_y_size];

		// Send command to the merge target
		const command = `/c gridworld.merge_map.prepare_chunks({${leftTop[0]}, ${leftTop[1]}}, {${rightBottom[0]}, ${rightBottom[1]}})`;
		const status = await this.controller.sendTo({ instanceId }, new lib.InstanceSendRconRequest(command));
		this.logger.info(`Prepare chunks status for ${instance.config.get("instance.name")}: ${status}`);
	}

	// Set tiles using the map tiles stored on the controller
	// Get tile colors from the instance
	const tileColors = JSON.parse(
		await this.controller.sendTo({ instanceId }, new lib.InstanceSendRconRequest("/c gridworld.merge_map.get_tile_colors()"))
	);
	const tileColorNames = Object.keys(tileColors);

	// Get map tile files
	const files = await fs.readdir(path.resolve(
		this.controller.config.get("controller.database_directory"),
		this.controller.config.get("gridworld.tiles_directory")
	));
	// Set tiles using the map tiles stored on the controller
	for (let filename of files.filter(file => file.endsWith(".png") && file.startsWith("tiles_"))) {
		const mapTile = await sharp(path.resolve(
			this.controller.config.get("controller.database_directory"),
			this.controller.config.get("gridworld.tiles_directory"),
			filename
		))
			.raw()
			.toBuffer();

		let mapTileData = Buffer.alloc(TILE_SIZE * TILE_SIZE * 9); // 4 bytes x, 4 bytes y, 1 byte tile index
		for (let i = 0; i < mapTile.length; i += 4) {
			// Get position in map tile
			const x = (i / 4) % TILE_SIZE;
			const y = Math.floor((i / 4) / TILE_SIZE);
			// Get world position
			const world_x = x + parseInt(filename.match(/x(-?\d+)/)[1], 10) * TILE_SIZE;
			const world_y = y + parseInt(filename.match(/y(-?\d+)/)[1], 10) * TILE_SIZE;

			const color = {
				r: mapTile[i],
				g: mapTile[i + 1],
				b: mapTile[i + 2],
				a: mapTile[i + 3],
			};
			// Ignore transparent pixels
			if (color.a !== 0) {
				// Find the same color in the tileColors
				const tileName = tileColorNames.find(tilename => {
					const tileColor = tileColors[tilename];
					return color.r === tileColor.r && color.g === tileColor.g && color.b === tileColor.b;
				});
				if (tileName !== undefined) {
					const offset = (i / 4) * 9;

					// Convert world_x (32bit int) to buffer
					mapTileData.writeInt32LE(world_x, offset);

					// Convert world_y (32bit int) to buffer
					mapTileData.writeInt32LE(world_y, offset + 4);

					// Get tile name index
					const tileIndex = tileColorNames.indexOf(tileName) + 1; // 1 indexed because Lua
					mapTileData.writeUInt8(tileIndex, offset + 8);
				} else {
					this.logger.warn(`Could not find tile color for pixel at ${world_x}, ${world_y} color ${color.r}, ${color.g}, ${color.b}`);
				}
			}
		}

		// Send map tile data to the merge target
		// Make sure the last character of mapTileData is not ] (decimal 93, 5D hex) or it will error
		const command = `/sc gridworld.merge_map.set_map_tile_data([========[${mapTileData.toString()}]========])`;
		const status = await this.controller.sendTo({ instanceId }, new lib.InstanceSendRconRequest(command));
		this.logger.info(`Set map tile data status for ${filename}: ${status}`);
	}

	for (let instance of instances) {
		// Ensure the instance is running
		if (instance.status === "stopped") {
			this.logger.info(`Starting instance ${instance.name}`);
			await this.controller.sendTo({ instanceId: instance.id }, new lib.InstanceStartRequest());
		}

		// Perform entity dump

	}
};
