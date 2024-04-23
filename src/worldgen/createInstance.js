"use strict";
const { InstanceInfo } = require("@clusterio/controller");
const lib = require("@clusterio/lib");

module.exports = async function createInstance(plugin, name, x, y, x_size, y_size, grid_id, game_port = undefined) {
	plugin.logger.info("Creating instance", name);
	let instanceConfig = new lib.InstanceConfig("controller");
	instanceConfig.set("instance.name", name);
	instanceConfig.set("gridworld.is_grid_square", true);
	instanceConfig.set("gridworld.grid_id", grid_id);
	instanceConfig.set("gridworld.grid_x_position", x);
	instanceConfig.set("gridworld.grid_y_position", y);
	instanceConfig.set("gridworld.grid_x_size", x_size);
	instanceConfig.set("gridworld.grid_y_size", y_size);
	if (game_port) {
		instanceConfig.set("factorio.game_port", game_port);
	}

	let instanceId = instanceConfig.get("instance.id");
	if (plugin.controller.instances.has(instanceId)) {
		throw new lib.RequestError(`Instance with ID ${instanceId} already exists`);
	}

	// Add common settings for the Factorio server
	let settings = {
		...instanceConfig.get("factorio.settings"),

		"name": `${plugin.controller.config.get("controller.name")} - ${name}`,
		"description": `Clusterio instance for ${plugin.controller.config.get("controller.name")}`,
		"tags": ["clusterio", "gridworld"],
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

	const instance = new InstanceInfo(instanceConfig, "unassigned", undefined, Date.now());
	plugin.controller.instances.set(instanceId, instance);
	await lib.invokeHook(plugin.controller.plugins, "onInstanceStatusChanged", instance, null);
	plugin.controller.addInstanceHooks(instance);
	return instanceConfig.get("instance.id");
};
