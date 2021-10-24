/**
 * @module
 */
"use strict";
const libErrors = require("@clusterio/lib/errors");
const libPlugin = require("@clusterio/lib/plugin");
const libLuaTools = require("@clusterio/lib/lua_tools");

class InstancePlugin extends libPlugin.BaseInstancePlugin {
	async init() {
		this.disconnecting = false;
	}

	onPrepareMasterDisconnect() {
		this.disconnecting = true;
	}

	onMasterConnectionEvent(event) {
		if (event === "connect") {
			this.disconnecting = false;
			(async () => {
				if (this.disconnecting) {
					return;
				}
			})().catch(
				err => this.logger.error(`Unexpected error:\n${err.stack}`)
			);
		}
	}
}

module.exports = {
	InstancePlugin,
};
