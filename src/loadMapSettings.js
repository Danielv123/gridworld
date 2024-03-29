"use strict";
const fs = require("fs-extra");

const lib = require("@clusterio/lib");

/**
 * Loads map settings from a factorio format
 * @param {object} args Object containing one of the following properties:
 * @param {number|undefined} args.seed Factorio seed
 * @param {string|undefined} args.mapExchangeString Map exchange string
 * @param {string|undefined} args.mapGenSettings Path to mapGenSettings.json
 * @param {string|undefined} args.mapSettings Path to mapSettings.json
 * @returns {Promise<object>} Parsed map settings
 */
async function loadMapSettings(args) {
	let seed = args.seed !== undefined ? args.seed : null;
	let mapGenSettings = null;
	let mapSettings = null;
	if (args.mapExchangeString) {
		let parsed = lib.readMapExchangeString(args.mapExchangeString);
		mapGenSettings = parsed.map_gen_settings;
		mapSettings = parsed.map_settings;
	}
	if (args.mapGenSettings) {
		mapGenSettings = JSON.parse(await fs.readFile(args.mapGenSettings));
	}
	if (args.mapSettings) {
		mapSettings = JSON.parse(await fs.readFile(args.mapSettings));
	}

	return {
		seed,
		mapGenSettings,
		mapSettings,
	};
}

module.exports = loadMapSettings;
