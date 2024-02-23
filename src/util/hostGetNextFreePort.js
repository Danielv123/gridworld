"use strict";

const mapFilter = require("./mapFilter");
const mapFind = require("./mapFind");

module.exports = function hostGetNextFreePort(controller, host_id) {
	const instances = mapFilter(controller.instances, instance => instance.config.get("instance.assigned_host") === host_id || true);
	let lowestPort = 10000;
	// Find next free port
	let port = lowestPort;
	function portIsInUse() {
		return mapFind(instances, instance => instance.game_port === port || instance.config.get("factorio.game_port") === port);
	}
	while (portIsInUse()) {
		port += 1;
	}
	return port;
};
