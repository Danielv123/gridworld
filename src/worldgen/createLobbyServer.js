"use strict";
const { libConfig, libPlugin, libErrors } = require("@clusterio/lib");
const assignInstance = require("./assignInstance");
const createSave = require("./createSave");

module.exports = async function createLobbyServer(plugin, slaveId, x_size, y_size) {
	// Create instance
	plugin.logger.info("Creating lobby server");
	const name = "Gridworld lobby server";
	let instanceConfig = new libConfig.InstanceConfig("master");
	await instanceConfig.init();
	instanceConfig.set("instance.name", name);
	instanceConfig.set("instance.auto_start", true);
	instanceConfig.set("gridworld.is_lobby_server", true);
	instanceConfig.set("gridworld.grid_id", Math.ceil(Math.random() * 1000));
	instanceConfig.set("gridworld.grid_x_size", x_size);
	instanceConfig.set("gridworld.grid_y_size", y_size);
	instanceConfig.set("factorio.game_port", 10000);

	let instanceId = instanceConfig.get("instance.id");
	if (plugin.master.instances.has(instanceId)) {
		throw new libErrors.RequestError(`Instance with ID ${instanceId} already exists`);
	}

	// Add common settings for the Factorio server
	let settings = {
		...instanceConfig.get("factorio.settings"),

		"name": `${plugin.master.config.get("master.name")} - ${name}`,
		"description": `Clusterio instance for ${plugin.master.config.get("master.name")}`,
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
		"autosave_slots": 1,
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
	const instance_id = instanceConfig.get("instance.id");
	// Assign instance to a slave (using first slave as a placeholder)
	await assignInstance(plugin, instance_id, slaveId);

	// Create map
	await createSave(
		plugin,
		instance_id,
		plugin.master.config.get("gridworld.gridworld_seed"),
		plugin.master.config.get("gridworld.gridworld_map_exchange_string")
	);
	return instance;
};
