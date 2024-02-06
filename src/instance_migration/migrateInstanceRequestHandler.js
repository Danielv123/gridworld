"use strict";
const crypto = require("crypto");
const events = require("events");
const util = require("util");

const lib = require("@clusterio/lib");
const messages = require("../../messages");


// Somehow require routes from packages/controller/src/routes

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
		}, app.locals.controller.config.get("controller.proxy_stream_timeout") * 1000),
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


module.exports = async function migrateInstanceRequestHandler(message, request) {
	let { instance_id, host_id } = message.data;
	let instance = this.controller.instances.get(instance_id);
	if (!instance) {
		throw new lib.RequestError(`Instance with ID ${instance_id} does not exist`);
	}

	if (instance.config.get("instance.assigned_host") === null) {
		throw new lib.RequestError(`Instance with ID ${instance_id} is not assigned to a host`);
	}

	let originHostId = instance.config.get("instance.assigned_host");
	let originHost = this.controller.hosts.get(originHostId);
	if (!originHost) {
		throw new lib.RequestError(`Host with ID ${originHostId} does not exist`);
	}

	const originHostConnection = this.controller.wsServer.hostConnections.get(originHostId);
	if (!originHostConnection) {
		throw new lib.RequestError(`Origin host with ID ${originHostId} is not online`);
	}

	let destinationHost = this.controller.hosts.get(host_id);
	if (!destinationHost) {
		throw new lib.RequestError(`Host with ID ${host_id} does not exist`);
	}

	const destinationHostConnection = this.controller.wsServer.hostConnections.get(host_id);
	if (!destinationHostConnection) {
		throw new lib.RequestError(`Destination host with ID ${host_id} is not online`);
	}

	// If the instance is running, stop it first
	const originalStatus = instance.status;
	if (instance.status === "running") {
		this.controller.sendTo({ instanceId: instance_id }, new lib.InstanceStopRequest({
			instance_id: instance_id,
		}));
	}

	// Get savefiles from origin host
	// TODO-migrate: I don't think this can be sent from host, check Controller.ts
	const saves = (await this.controller.sendTo({ instanceId: instance_id }, new lib.InstanceSaveDetailsListRequest())).list;

	// Delete any remnants of the instance on the destination host
	try {
		await destinationHostConnection.send(new lib.InstanceDeleteInternalRequest(instance_id));
	} catch (e) { }

	const preparedUploads = await Promise.all(saves.map(async save => {
		const filename = save.name;
		let stream = await createProxyStream(this.controller.app);
		stream.filename = filename;

		let ready = new Promise((resolve, reject) => {
			stream.events.on("source", resolve);
			stream.events.on("timeout", () => reject(
				new lib.RequestError("Timed out establishing stream from host")
			));
		});
		ready.catch(() => { });

		// Send start upload message to host
		await this.controller.sendTo({ hostId: host_id }, new lib.InstancePushSaveRequest({
			instanceId: instance_id,
			stream_id: stream.id,
			save: filename,
		}));

		await ready;

		return {
			stream_id: stream.id,
			filename,
		};
	}));

	// Unassign instance from origin host
	await originHostConnection.send(new lib.InstanceUnassignInternalRequest(instance_id));

	try {
		// Assign instance to destination host
		instance.config.set("instance.assigned_host", host_id);
		await destinationHostConnection.send(new lib.InstanceAssignInternalRequest({
			instanceId: instance_id,
			config: instance.config.toRemote("host"),
		}));
	} catch (e) {
		// Reassign instance to origin host
		instance.config.set("instance.assigned_host", originHostId);

		await originHostConnection.send(new lib.InstanceAssignInternalRequest({
			instanceId: instance_id,
			config: instance.config.toRemote("host"),
		}));

		throw e;
	}
	try {
		// Start transfer of files to host
		for (let preparedUpload of preparedUploads) {
			const { stream_id, filename } = preparedUpload;
			logger.info(`Transferring ${preparedUpload.filename}`);

			// Make the other host download the file
			await destinationHostConnection.send(new lib.InstancePullSaveRequest({
				instance_id,
				stream_id,
				name: filename,
			}));
		}
	} catch (e) {
		// Unassign instance from destination host
		await destinationHostConnection.send(new lib.InstanceUnassignInternalRequest(instance_id));

		// Assign instance to origin host
		instance.config.set("instance.assigned_host", originHostId);
		await originHostConnection.send(new lib.InstanceAssignInternalRequest({
			instanceId: instance_id,
			config: instance.config.toRemote("host"),
		}));

		throw e;
	}

	// Restart the instance if we stopped it
	if (originalStatus === "running") {
		await this.controller.sendTo({ instanceId: instance_id }, new lib.InstanceStartRequest({
			save: null,
		}));
	}

	// Clean up the leftover files
	await originHostConnection.send(new lib.InstanceDeleteInternalRequest(instance_id));

	return { status: "success" };
};
