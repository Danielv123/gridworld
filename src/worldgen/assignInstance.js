"use strict";
const lib = require("@clusterio/lib");

module.exports = async function assignInstance(plugin, instanceId, hostId) {
	// Code lifted from ControlConnection.js assignInstanceCommandRequestHandler()
	let instance = plugin.controller.getRequestInstance(instanceId);
	if (!instance) {
		throw new libErrors.RequestError(`Instance with ID ${instanceId} does not exist`);
	}

	// Check if target host is connected
	let newHostConnection;
	if (hostId !== undefined) {
		newHostConnection = plugin.controller.wsServer.hostConnections.get(hostId);
		if (!newHostConnection) {
			// The case of the host not getting the assign instance message
			// still have to be handled, so it's not a requirement that the
			// target host be connected to the controller while doing the
			// assignment, but it is IMHO a better user experience if this
			// is the case.
			throw new lib.RequestError("Target host is not connected to the controller");
		}
	}

	// Unassign from currently assigned host if it is connected.
	let currentAssignedHost = instance.config.get("instance.assigned_host");
	if (currentAssignedHost !== null && hostId !== currentAssignedHost) {
		let oldHostConnection = plugin.controller.wsServer.hostConnections.get(currentAssignedHost);
		if (oldHostConnection && !oldHostConnection.connector.closing) {
			await oldHostConnection.send(new lib.InstanceUnassignInternalRequest(instanceId));
		}
	}

	// Remove saves recorded from currently assigned host if any
	// this.clearSavesOfInstance(instanceId); // Not sure if we want this, wasn't in pre v14 code.
	// If we do need it, we might as well use plugin.controller.instanceAssign(instanceId, hostId);

	// Assign to target
	instance.config.set("instance.assigned_host", hostId ?? null);
	// "fieldChanged" event handler will set this.instancesDirty
	if (hostId !== undefined && newHostConnection) {
		await newHostConnection.send(
			new lib.InstanceAssignInternalRequest(instanceId, instance.config.toRemote("host"))
		);
	} else {
		instance.status = "unassigned";
		instance.updatedAtMs = Date.now();
		plugin.controller.instanceDetailsUpdated([instance]);
	}
};
