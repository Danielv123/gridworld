"use strict";
/**
 * Save instance load factor to database for persistence and querying
 * @param {object} message - Message object
 * @param {object} message.data - Message data
 * @param {number} message.data.load_factor - Instance load factor
 * @param {number} message.data.instance_id - Instance ID
 */
module.exports = async function setLoadFactorEventHandler(message) {
	let instance_data = this.gridworldDatastore.get(message.data.instance_id);
	if (!instance_data) {
		instance_data = {};
	}
	instance_data.load_factor = message.data.load_factor;
	this.gridworldDatastore.set(message.data.instance_id, instance_data);
};
