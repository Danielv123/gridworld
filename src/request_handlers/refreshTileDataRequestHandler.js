"use strict";
const path = require("path");
const sharp = require("sharp");

const { libLink } = require("@clusterio/lib");
const libErrors = require("@clusterio/lib/errors");

const { zoomOutLevel } = require("./../tileZoomFunctions");
const info = require("./../../info");

module.exports = async function refreshTileDataRequestHandler(message) {
	let instance = this.master.instances.get(message.data.instance_id);
	if (!instance) {
		throw new libErrors.RequestError(`Instance with ID ${message.data.instance_id} does not exist`);
	}

	let slaveId = instance.config.get("instance.assigned_slave");
	if (!slaveId) {
		throw new libErrors.RequestError("Instance is not assigned to a slave");
	}

	let slaveConnection = this.master.wsServer.slaveConnections.get(slaveId);
	if (!slaveConnection) {
		throw new libErrors.RequestError("Instance is assigned to a slave that is not connected");
	}

	// If the instance is stopped, temporarily start it.
	let originalStatus = instance.status;
	if (instance.status === "stopped") {
		// Start instance
		await libLink.messages.startInstance.send(slaveConnection, {
			instance_id: message.data.instance_id,
			save: null,
		});
	}

	// Get bounds
	const world_x = instance.config.get("gridworld.grid_x_position");
	const world_y = instance.config.get("gridworld.grid_y_position");
	const x_size = instance.config.get("gridworld.grid_x_size");
	const y_size = instance.config.get("gridworld.grid_y_size");

	// Scan as chunks
	let chunks = [];
	const CHUNK_SIZE = 512; // About 1kb per chunk
	for (let x = 0; x < x_size; x += CHUNK_SIZE) {
		if (x > x_size) { break; }
		for (let y = 0; y < y_size; y += CHUNK_SIZE) {
			if (y > y_size) { break; }
			chunks.push({
				position_a: [
					((world_x - 1) * x_size + x),
					((world_y - 1) * y_size + y),
				],
				position_b: [
					((world_x - 1) * x_size + x + CHUNK_SIZE),
					((world_y - 1) * y_size + y + CHUNK_SIZE),
				],
			});
		}
	}
	for (let i = 0; i < chunks.length; i++) {
		let chunk = chunks[i];

		let data = await info.messages.getTileData.send(slaveConnection, {
			instance_id: message.data.instance_id,
			...chunk,
		});

		if (data.tile_data[0].includes("Cannot execute command")) {
			this.logger.warn(`Getting tile data failed for instance ${message.data.instance_id} at ${chunk.position_a} to ${chunk.position_b} with error: ${data.tile_data[0]}`);
		} else {
			// Create raw array of pixels
			let rawPixels = Uint8Array.from(
				data.tile_data.map(tile => [Number(`0x${tile.slice(0, 2)}`), Number(`0x${tile.slice(2, 4)}`), Number(`0x${tile.slice(4, 6)}`), 255]).flat()
			);

			let x_pos = Math.round(chunk.position_a[0] / CHUNK_SIZE);// + 512); // 512 at zoom level 10
			let y_pos = Math.round(chunk.position_a[1] / CHUNK_SIZE);// + 512);

			let filename = `z10x${x_pos}y${y_pos}.png`;
			// Create image from tile data
			let image = await sharp(rawPixels, {
				raw: {
					width: CHUNK_SIZE,
					height: CHUNK_SIZE,
					channels: 4,
				},
			});
			await image.toFile(path.resolve(this._tilesPath, filename));
			// console.log("Processed image", filename);
		}
	}
	if (originalStatus === "stopped") {
		// Stop instance again
		await libLink.messages.stopInstance.send(slaveConnection, {
			instance_id: message.data.instance_id,
		});
	}
	// Create zoomed out tiles
	for (let i = 0; i < chunks.length; i++) {
		let chunk = chunks[i];
		let x_pos = Math.round(chunk.position_a[0] / CHUNK_SIZE);// + 512); // 512 at zoom level 10
		let y_pos = Math.round(chunk.position_a[1] / CHUNK_SIZE);// + 512);
		try {
			await zoomOutLevel({
				currentZoomLevel: 10,
				targetZoomLevel: 7,
				parentX: x_pos - (x_pos % 2),
				parentY: y_pos - (y_pos % 2),
				CHUNK_SIZE,
				tilePath: this._tilesPath,
			});
		} catch (e) { }
	}
};
