"use strict";
module.exports = async function createFactionRequestHandler(message, request, link) {
	const new_faction = {
		faction_id: message.data.faction_id,
		name: message.data.name,
		open: message.data.open,
		members: message.data.members,
		about: message.data.about,
	};
	this.factionsDatastore.set(message.data.faction_id, new_faction);
	return {
		ok: true,
		faction: new_faction,
	};
};
