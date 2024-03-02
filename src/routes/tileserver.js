"use strict";
const fs = require("fs-extra");
const path = require("path");
const sharp = require("sharp");

module.exports = async function registerTileServer(app, tilesPath) {
	// Create single color PNG for missing tiles using Sharp
	const blackImage = await sharp({
		create: {
			width: 256,
			height: 256,
			channels: 4,
			background: { r: 0, g: 0, b: 0, alpha: 0 },
			// background: { r: 65, g: 57, b: 18, alpha: 1 }, // Forest green
		},
	})
		.png()
		.toBuffer();

	// Serve tiles
	app.get("/api/gridworld/tiles/:z/:x/:y.png", async (req, res) => {
		try {
			let file = await fs.readFile(path.resolve(tilesPath, `tiles_z${req.params.z}x${req.params.x}y${req.params.y}.png`));
			res.send(file);
		} catch (e) {
			res.send(blackImage);
		}
	});
	// Serve entities
	app.get("/api/gridworld/entities/:z/:x/:y.png", async (req, res) => {
		try {
			let file = await fs.readFile(path.resolve(tilesPath, `z${req.params.z}x${req.params.x}y${req.params.y}.png`));
			res.send(file);
		} catch (e) {
			res.send(blackImage);
		}
	});
};
