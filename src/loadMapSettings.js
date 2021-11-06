const fs = require("fs-extra");

const { libFactorio } = require("@clusterio/lib");

/**
 * 
 * @param {object} args
 * @param {number|undefined} args.seed 
 * @param {string|undefined} args.mapExchangeString Map exchange string
 * @param {string|undefined} args.mapGenSettings Path to mapGenSettings.json
 * @param {string|undefined} args.mapSettings Path to mapSettings.json
 * @returns 
 */
async function loadMapSettings(args) {
	let seed = args.seed !== undefined ? args.seed : null;
	let mapGenSettings = null;
	let mapSettings = null;
	if (args.mapExchangeString) {
		let parsed = libFactorio.readMapExchangeString(args.mapExchangeString);
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
