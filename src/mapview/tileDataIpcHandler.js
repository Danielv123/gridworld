"use strict";

const messages = require("./../../messages");

module.exports = async function handleTileDataIpc(instancePlugin, json) {
	let tileData = json.data.split(";");
	if (!Array.isArray(tileData)) {
		instancePlugin.logger.error(`Received tile data with invalid data (should be array) ${json.data}`);
		return false;
	}
	const type = json.type;
	if (!["tiles", "pixels"].includes(type)) {
		instancePlugin.logger.error(`Received tile data with invalid type ${type}`);
	}

	await instancePlugin.instance.sendTo("controller", new messages.TileData(type, tileData, json.position, json.size, json.layer));
};
