"use strict";
const { libLink } = require("@clusterio/lib");
const loadMapSettings = require("./../loadMapSettings");

module.exports = async function createSave(plugin, instance_id, seed_orig, mapExchangeString) {
	let instance = plugin.master.instances.get(instance_id);
	let slave_id = instance.config.get("instance.assigned_slave");

	let { seed, mapGenSettings, mapSettings } = await loadMapSettings({
		seed: seed_orig,
		mapExchangeString,
	});

	let slaveConnection = plugin.master.wsServer.slaveConnections.get(slave_id);
	return await libLink.messages.createSave.send(slaveConnection, {
		instance_id,
		name: "Gridworld",
		seed,
		map_gen_settings: mapGenSettings,
		map_settings: mapSettings,
	});
};
