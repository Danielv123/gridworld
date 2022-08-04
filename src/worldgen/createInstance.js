"use strict";
const { libConfig, libPlugin, libErrors } = require("@clusterio/lib");

module.exports = async function createInstance(plugin, name, x, y, x_size, y_size, grid_id) {
	plugin.logger.info("Creating instance", name);
	let instanceConfig = new libConfig.InstanceConfig("master");
	await instanceConfig.init();
	instanceConfig.set("instance.name", name);
	instanceConfig.set("gridworld.grid_x_position", x);
	instanceConfig.set("gridworld.grid_y_position", y);
	instanceConfig.set("gridworld.grid_x_size", x_size);
	instanceConfig.set("gridworld.grid_y_size", y_size);

	let instanceId = instanceConfig.get("instance.id");
	if (plugin.master.instances.has(instanceId)) {
		throw new libErrors.RequestError(`Instance with ID ${instanceId} already exists`);
	}

	// Add common settings for the Factorio server
	let settings = {
		...instanceConfig.get("factorio.settings"),

		"name": `${plugin.master.config.get("master.name")} - ${name}`,
		"description": `Clusterio instance for ${plugin.master.config.get("master.name")}`,
		"tags": ["clusterio"],
		"max_players": 0,
		"visibility": { "public": true, "lan": true },
		"username": "",
		"token": "",
		"game_password": "",
		"require_user_verification": true,
		"max_upload_in_kilobytes_per_second": 0,
		"max_upload_slots": 5,
		"ignore_player_limit_for_returning_players": false,
		"allow_commands": "admins-only",
		"autosave_interval": 10,
		"autosave_slots": 5,
		"afk_autokick_interval": 0,
		"auto_pause": false,
		"only_admins_can_pause_the_game": true,
		"autosave_only_on_server": true,
	};
	instanceConfig.set("factorio.settings", settings);

	let instance = { config: instanceConfig, status: "unassigned" };
	plugin.master.instances.set(instanceId, instance);
	await libPlugin.invokeHook(plugin.master.plugins, "onInstanceStatusChanged", instance, null);
	plugin.master.addInstanceHooks(instance);
	return instanceConfig.get("instance.id");
};
