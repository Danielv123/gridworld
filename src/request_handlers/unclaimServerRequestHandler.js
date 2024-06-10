"use strict";

module.exports = async function unclaimServerRequestHandler(message) {
	// message.data = {
	//  faction_id: "test",
	//  player_name: "test",
	//  instance_id: 1,
	// };

	// TODO: Method no longer exists
	this.setInstanceConfigField(message.data.instance_id, "gridworld.claimed_by_faction", "-");
	return {
		ok: true,
		message: "Server unclaimed",
	};
};
