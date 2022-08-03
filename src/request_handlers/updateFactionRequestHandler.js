"use strict";
module.exports = async function updateFactionRequestHandler(message, request, link) {
	const faction = this.factionsDatastore.get(message.data.faction_id);
	if (faction) {
		faction.name = message.data.name;
		faction.open = message.data.open;
		faction.about = message.data.about;
		this.factionsDatastore.set(message.data.faction_id, faction);

		// Propagate changes to all online instances
		for (let instance in this.master.instances) {
			// TODO: Find a way to send the updated faction to all online gridworld instances included lobby server
			// 1. Use gridworld config?
			// 2. Loop over all instances on the master?
		}

		return {
			ok: true,
			message: "Faction updated",
			faction: faction,
		};
	}
	return {
		ok: false,
		message: "Faction not found",
	};
};
