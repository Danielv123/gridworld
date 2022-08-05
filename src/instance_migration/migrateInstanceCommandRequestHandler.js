"use strict";
const crypto = require("crypto");
const events = require("events");
const util = require("util");

const { libLink, libErrors } = require("@clusterio/lib");
const { logger } = require("@clusterio/lib/logging");


// Somehow require routes from packages/master/src/routes

async function createProxyStream(app) {
	let asyncRandomBytes = util.promisify(crypto.randomBytes);
	let id = (await asyncRandomBytes(8)).toString("hex");
	let stream = {
		id,
		flowing: false,
		size: null,
		mime: null,
		filename: null,
		events: new events.EventEmitter(),
		timeout: setTimeout(() => {
			stream.events.emit("timeout");
		}, app.locals.master.config.get("master.proxy_stream_timeout") * 1000),
	};
	stream.events.on("close", () => {
		clearTimeout(stream.timeout);
		app.locals.streams.delete(id);
	});
	stream.events.on("timeout", () => {
		stream.events.emit("close");
	});
	app.locals.streams.set(id, stream);
	return stream;
}


module.exports = async function migrateInstanceCommandRequestHandler(message, request) {
	let { instance_id, slave_id } = message.data;
	let instance = this._master.instances.get(instance_id);
	if (!instance) {
		throw new libErrors.RequestError(`Instance with ID ${instance_id} does not exist`);
	}

	if (instance.config.get("instance.assigned_slave") === null) {
		throw new libErrors.RequestError(`Instance with ID ${instance_id} is not assigned to a slave`);
	}

	let originSlaveId = instance.config.get("instance.assigned_slave");
	let originSlave = this._master.slaves.get(originSlaveId);
	if (!originSlave) {
		throw new libErrors.RequestError(`Slave with ID ${originSlaveId} does not exist`);
	}

	const originSlaveConnection = this._master.wsServer.slaveConnections.get(originSlaveId);
	if (!originSlaveConnection) {
		throw new libErrors.RequestError(`Origin slave with ID ${originSlaveId} is not online`);
	}

	let destinationSlave = this._master.slaves.get(slave_id);
	if (!destinationSlave) {
		throw new libErrors.RequestError(`Slave with ID ${slave_id} does not exist`);
	}

	const destinationSlaveConnection = this._master.wsServer.slaveConnections.get(slave_id);
	if (!destinationSlaveConnection) {
		throw new libErrors.RequestError(`Destination slave with ID ${slave_id} is not online`);
	}

	// If the instance is running, stop it first
	const originalStatus = instance.status;
	if (instance.status === "running") {
		await libLink.messages.stopInstance.send(originSlaveConnection, {
			instance_id: instance_id,
		});
	}

	// Get savefiles from origin slave
	const saves = (await libLink.messages.listSaves.send(originSlaveConnection, {
		instance_id: instance_id,
	})).list;

	// Delete any remnants of the instance on the destination slave
	try {
		await libLink.messages.deleteInstance.send(destinationSlaveConnection, {
			instance_id: instance_id,
		});
	} catch (e) {}

	const preparedUploads = await Promise.all(saves.map(async save => {
		const filename = save.name;
		let stream = await createProxyStream(this._master.app);
		stream.filename = filename;

		let ready = new Promise((resolve, reject) => {
			stream.events.on("source", resolve);
			stream.events.on("timeout", () => reject(
				new libErrors.RequestError("Timed out establishing stream from slave")
			));
		});
		ready.catch(() => { });

		// Send start upload message to slave
		await this._master.forwardRequestToInstance(libLink.messages.pushSave, {
			instance_id,
			stream_id: stream.id,
			save: filename,
		});

		await ready;

		return {
			stream_id: stream.id,
			filename,
		};
	}));

	// Unassign instance from origin slave
	await libLink.messages.unassignInstance.send(originSlaveConnection, {
		instance_id,
	});

	try {
		// Assign instance to destination slave
		instance.config.set("instance.assigned_slave", slave_id);
		await libLink.messages.assignInstance.send(destinationSlaveConnection, {
			instance_id,
			serialized_config: instance.config.serialize("slave"),
		});
	} catch (e) {
		// Reassign instance to origin slave
		instance.config.set("instance.assigned_slave", originSlaveId);
		await libLink.messages.assignInstance.send(originSlaveConnection, {
			instance_id,
			serialized_config: instance.config.serialize("slave"),
		});

		throw e;
	}
	try {
		// Start transfer of files to slave
		for (let preparedUpload of preparedUploads) {
			const { stream_id, filename } = preparedUpload;
			logger.info(`Transferring ${preparedUpload.filename}`);

			// Make the other slave download the file
			await libLink.messages.pullSave.send(destinationSlaveConnection, {
				instance_id,
				stream_id,
				filename,
			});
		}
	} catch (e) {
		// Unassign instance from destination slave
		await libLink.messages.unassignInstance.send(destinationSlaveConnection, {
			instance_id,
		});

		// Assign instance to origin slave
		instance.config.set("instance.assigned_slave", originSlaveId);
		await libLink.messages.assignInstance.send(originSlaveConnection, {
			instance_id,
			serialized_config: instance.config.serialize("slave"),
		});

		throw e;
	}

	// Restart the instance if we stopped it
	if (originalStatus === "running") {
		await libLink.messages.startInstance.send(destinationSlaveConnection, {
			instance_id,
			save: null,
		});
	}

	// Clean up the leftover files
	await libLink.messages.deleteInstance.send(originSlaveConnection, {
		instance_id,
	});

	return { status: "success" };
};
