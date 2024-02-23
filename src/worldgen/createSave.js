"use strict";
const lib = require("@clusterio/lib");
const loadMapSettings = require("./../loadMapSettings");

module.exports = async function createSave(plugin, instance_id, seed_orig, mapExchangeString) {
	let instance = plugin.controller.instances.get(instance_id);
	let host_id = instance.config.get("instance.assigned_host");

	let { seed, mapGenSettings, mapSettings } = await loadMapSettings({
		seed: seed_orig,
		mapExchangeString,
	});

	let hostConnection = plugin.controller.wsServer.hostConnections.get(host_id);
	return await hostConnection.sendTo({ instanceId: instance_id }, new lib.InstanceCreateSaveRequest(
		"Gridworld",
		seed,
		mapGenSettings,
		mapSettings,
	));
};
