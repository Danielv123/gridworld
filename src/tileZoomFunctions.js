"use strict";
const fs = require("fs-extra");
const path = require("path");
const sharp = require("sharp");

async function zoomInLevel({
	currentZoomLevel,
	targetZoomLevel,
	parentX,
	parentY,
	CHUNK_SIZE,
	tilePath,
	filename,
}) {
	for (let a = 0; a < 2; a++) {
		for (let b = 0; b < 2; b++) {
			let newFileName = `z${currentZoomLevel + 1}x${parentX * 2 + a}y${parentY * 2 + b}.png`;

			// Create image from tile data
			let newImage = await sharp(path.resolve(tilePath, filename))
				.extract({
					width: CHUNK_SIZE / 2,
					height: CHUNK_SIZE / 2,
					top: a * CHUNK_SIZE / 2,
					left: b * CHUNK_SIZE / 2,
				})
				.resize(CHUNK_SIZE, CHUNK_SIZE, {
					kernel: sharp.kernel.nearest,
				})
				.toFile(path.resolve(tilePath, newFileName));
			// console.log("Processed image", newFileName);

			if (currentZoomLevel + 1 < targetZoomLevel) {
				// recurse
				await zoomInLevel({
					currentZoomLevel: currentZoomLevel + 1,
					targetZoomLevel,
					parentX: parentX * 2 + a,
					parentY: parentY * 2 + b,
					CHUNK_SIZE,
					tilePath,
					filename: newFileName,
				});
			}
		}
	}
}

async function zoomOutLevel({
	currentZoomLevel,
	targetZoomLevel,
	parentX,
	parentY,
	CHUNK_SIZE,
	tilePath,
}) {
	let newZoom = currentZoomLevel - 1;
	let filename = `z${newZoom}x${parentX / 2}y${parentY / 2}.png`;

	let images = [];

	for (let imageSpec of [{ // Top left
		input: path.resolve(tilePath, `z${currentZoomLevel}x${parentX}y${parentY}.png`),
		gravity: "northwest",
	}, { // Top right
		input: path.resolve(tilePath, `z${currentZoomLevel}x${parentX + 1}y${parentY}.png`),
		gravity: "northeast",
	}, { // Bottom left
		input: path.resolve(tilePath, `z${currentZoomLevel}x${parentX}y${parentY + 1}.png`),
		gravity: "southwest",
	}, { // Bottom right
		input: path.resolve(tilePath, `z${currentZoomLevel}x${parentX + 1}y${parentY + 1}.png`),
		gravity: "southeast",
	}]) {
		if (await fs.pathExists(imageSpec.input)) {
			images.push(imageSpec);
		}
	}
	let compositeImage = await sharp({
		create: {
			width: CHUNK_SIZE * 2,
			height: CHUNK_SIZE * 2,
			channels: 4,
			background: { r: 0, g: 0, b: 0, alpha: 0 },
		},
	})
		.composite(images)
		.png()
		.toBuffer();
	// This needs to be split into 2 stages to avoid sharp interpreting the operation order incorrectly
	await sharp(compositeImage)
		.resize(CHUNK_SIZE, CHUNK_SIZE, {
			fit: "contain",
			kernel: sharp.kernel.nearest,
		})
		.toFile(path.resolve(tilePath, filename));
	// console.log("Processed composite image", filename);
	if (
		newZoom > targetZoomLevel
		// && Math.floor(parentX / 2) % 2 === 1
		// && Math.floor(parentY / 2) % 2 === 1
	) {
		await zoomOutLevel({
			currentZoomLevel: newZoom,
			targetZoomLevel,
			parentX: parentX / 2 - (Math.floor(parentX / 2) % 2),
			parentY: parentY / 2 - (Math.floor(parentY / 2) % 2),
			CHUNK_SIZE,
			tilePath,
		});
	}
}

module.exports = {
	zoomInLevel,
	zoomOutLevel,
};
