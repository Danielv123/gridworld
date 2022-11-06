"use strict";
module.exports = async function createFactionRequestHandler(message, request, link) {
	const new_faction = {
		faction_id: message.data.faction_id,
		name: message.data.name,
		open: message.data.open,
		members: message.data.members,
		about: message.data.about,
		friends: message.data.friends || [],
		enemies: message.data.enemies || [],
		instances: message.data.instances || [],
	};
	this.factionsDatastore.set(message.data.faction_id, new_faction);

	// Propagate changes to all online instances
	this.broadcastEventToSlaves(this.info.messages.factionUpdate, { faction: new_faction });

	// Propagate changes to listening web clients
	for (let sub of this.subscribedControlLinks) {
		if (sub.faction_list) { this.info.messages.factionUpdate.send(sub.link, { faction: new_faction }); }
	}

	return {
		ok: true,
		faction: new_faction,
	};
};
