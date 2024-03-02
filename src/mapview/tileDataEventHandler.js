"use strict";
const sharp = require("sharp");
const path = require("path");
sharp.cache(false);
const messages = require("../../messages");

module.exports = async function tileDataEventHandler({ type, data, size, position }) {
	// console.log(type, size, position);
	const updates = new Map();
	// Image tiles are 512x512 pixels arranged in a grid, starting at 0,0
	const TILE_SIZE = 512;
	if (type === "pixels") {
		// console.log(data);
		for (let i = 0; i < data.length; i += 3) {
			const x = Math.floor(data[i]); // Convert from string and strip decimals
			const y = Math.floor(data[i + 1]); // Convert from string and strip decimals
			const rgba = [Number(`0x${data[i + 2].slice(0, 2)}`), Number(`0x${data[i + 2].slice(2, 4)}`), Number(`0x${data[i + 2].slice(4, 6)}`), 255];

			// Figure out which image tile the pixel belongs to
			const x_tile = (x - x % TILE_SIZE) / TILE_SIZE - 1;
			const y_tile = (y - y % TILE_SIZE) / TILE_SIZE;
			const filename = `z10x${x_tile}y${y_tile}.png`;
			if (!updates.has(filename)) {
				updates.set(filename, new Set());
			}
			updates.get(filename).add([
				x % TILE_SIZE,
				y % TILE_SIZE,
				rgba,
			]);
		}
	} else if (type === "tiles") {
		// When using the chunk format, data is arranged relative to a single chunk position coordinate.
		// This is done for compression purposes.
		const lineLength = size;
		const originPosition = position;

		// Iterate over the tiles and update the image
		for (let i = 0; i < data.length; i++) {
			const x = i % lineLength;
			const y = Math.floor(i / lineLength);
			const rgba = [Number(`0x${data[i].slice(0, 2)}`), Number(`0x${data[i].slice(2, 4)}`), Number(`0x${data[i].slice(4, 6)}`), 255];

			// Figure out which image tile the pixel belongs to
			const pixel_world_x = originPosition[0] + x;
			const pixel_world_y = originPosition[1] + y;
			const x_tile = (pixel_world_x - pixel_world_x % TILE_SIZE) / TILE_SIZE + (pixel_world_x < 0 ? -1 : 0);
			const y_tile = (pixel_world_y - pixel_world_y % TILE_SIZE) / TILE_SIZE + (pixel_world_y < 0 ? -1 : 0);
			const filename = `tiles_z10x${x_tile}y${y_tile}.png`;
			if (!updates.has(filename)) {
				updates.set(filename, new Set());
			}
			updates.get(filename).add([
				(originPosition[0] + x + TILE_SIZE) % TILE_SIZE, // Normalize from +inf to -inf to 0 to 512
				(originPosition[1] + y + TILE_SIZE) % TILE_SIZE,
				rgba,
			]);
		}
	}
	// Perform image updates
	for (const [filename, pixels] of updates) {
		// console.log("updating", filename);
		// Check if image exists, otherwise create one
		let raw;
		try {
			raw = await sharp(path.resolve(this._tilesPath, filename))
				.raw()
				.toBuffer();
		} catch (e) {
			raw = await sharp({
				create: {
					width: TILE_SIZE,
					height: TILE_SIZE,
					channels: 4,
					background: { r: 20, g: 20, b: 20, alpha: 0 },
				},
			})
				.raw()
				.toBuffer();
		}
		// Write pixels
		for (const [x, y, rgba] of pixels) {
			const index = (y * TILE_SIZE + x) * 4;
			raw[index] = rgba[0];
			raw[index + 1] = rgba[1];
			raw[index + 2] = rgba[2];
			raw[index + 3] = rgba[3];
		}
		// Convert back to sharp and write to file
		await sharp(raw, {
			raw: {
				width: TILE_SIZE,
				height: TILE_SIZE,
				channels: 4,
			},
		})
			.png()
			.toFile(path.resolve(this._tilesPath, filename));
	}
};
