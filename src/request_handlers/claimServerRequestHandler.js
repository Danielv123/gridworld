"use strict";

module.exports = async function claimServerRequestHandler(message) {
	// message.data = {
	//  faction_id: "test",
	//  player_name: "test",
	//  instance_id: 1,
	// };

	// Check if the faction exists
	const faction = this.factionsDatastore.get(message.data.faction_id);
	if (!faction) {
		return {
			ok: false,
			message: "Faction does not exist",
		};
	}
	// TODO: Method no longer exists
	this.setInstanceConfigField(message.data.instance_id, "gridworld.claimed_by_faction", message.data.faction_id);
	return {
		ok: true,
		message: "Server claimed",
	};
};
