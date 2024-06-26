"use strict";

const messages = require("../../messages");

module.exports = async function updateFactionRequestHandler(message, link) {
	const faction = this.factionsDatastore.get(message.data.faction_id);
	if (faction) {
		faction.name = message.data.name;
		faction.open = message.data.open;
		faction.about = message.data.about;
		this.factionsDatastore.set(message.data.faction_id, faction);

		// Propagate changes to all online instances
		await this.controller.sendTo("allInstances", new messages.FactionUpdate({ faction: faction }));

		// Propagate changes to listening web clients
		for (let sub of this.subscribedControlLinks) {
			if (sub.faction_list) {
				sub.link.send(new messages.FactionUpdate({ faction: faction }));
			}
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
