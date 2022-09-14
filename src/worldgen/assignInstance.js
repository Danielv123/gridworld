"use strict";
const { libLink, libErrors } = require("@clusterio/lib");

module.exports = async function assignInstance(plugin, instance_id, slave_id) {
	// Code lifted from ControlConnection.js assignInstanceCommandRequestHandler()
	let instance = plugin.master.instances.get(instance_id);
	if (!instance) {
		throw new libErrors.RequestError(`Instance with ID ${instance_id} does not exist`);
	}

	// Check if target slave is connected
	let newSlaveConnection;
	if (slave_id !== null) {
		newSlaveConnection = plugin.master.wsServer.slaveConnections.get(slave_id);
		if (!newSlaveConnection) {
			// The case of the slave not getting the assign instance message
			// still have to be handled, so it's not a requirement that the
			// target slave be connected to the master while doing the
			// assignment, but it is IMHO a better user experience if this
			// is the case.
			throw new libErrors.RequestError("Target slave is not connected to the master server");
		}
	}

	// Unassign from currently assigned slave if it is connected.
	let currentAssignedSlave = instance.config.get("instance.assigned_slave");
	if (currentAssignedSlave !== null && slave_id !== currentAssignedSlave) {
		let oldSlaveConnection = plugin.master.wsServer.slaveConnections.get(currentAssignedSlave);
		if (oldSlaveConnection && !oldSlaveConnection.connector.closing) {
			await libLink.messages.unassignInstance.send(oldSlaveConnection, { instance_id });
		}
	}

	// Assign to target
	instance.config.set("instance.assigned_slave", slave_id);
	if (slave_id !== null) {
		await libLink.messages.assignInstance.send(newSlaveConnection, {
			instance_id,
			serialized_config: instance.config.serialize("slave"),
		});
	}
};
