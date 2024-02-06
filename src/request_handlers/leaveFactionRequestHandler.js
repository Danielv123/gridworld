"use strict";

const messages = require("../../messages");

module.exports = async function leaveFactionRequestHandler(message, request, link) {
	const faction = this.factionsDatastore.get(message.data.faction_id);
	if (faction) {
		// Remove the player from the faction
		faction.members = faction.members.filter(member => member.name.toLowerCase() !== message.data.player_name.toLowerCase());

		// Propagate changes to all online instances
		this.controller.sendTo("allInstances", new messages.FactionUpdate({ faction: faction }));

		// Propagate changes to listening web clients
		for (let sub of this.subscribedControlLinks) {
			if (sub.faction_list) {
				sub.link.send(new messages.FactionUpdate({ faction: faction }));
			}
		}

		return {
			ok: true,
			message: `Removed ${message.data.player_name} from faction ${faction.name}`,
		};
	}
	return {
		ok: false,
		message: "Faction not found",
	};
};
