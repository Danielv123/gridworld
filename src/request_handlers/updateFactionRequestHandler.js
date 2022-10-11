"use strict";
module.exports = async function updateFactionRequestHandler(message, request, link) {
	const faction = this.factionsDatastore.get(message.data.faction_id);
	if (faction) {
		faction.name = message.data.name;
		faction.open = message.data.open;
		faction.about = message.data.about;
		this.factionsDatastore.set(message.data.faction_id, faction);

		// Propagate changes to all online instances
		this.broadcastEventToSlaves(this.info.messages.factionUpdate, { faction: faction });

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
