"use strict";

const messages = require("../../messages");

module.exports = async function factionChangeMemberRoleRequestHandler(message, request, link) {
	const faction = this.factionsDatastore.get(message.data.faction_id);
	if (faction) {
		// Check that the player is in the faction
		const member = faction.members.find(m => m.name.toLowerCase() === message.data.player_name.toLowerCase());
		if (!member) {
			return {
				ok: false,
				message: "Player is not in faction",
			};
		}

		// Change the member role
		const old_role = member.role;
		member.role = message.data.role;

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
			message: `Changed role of ${message.data.player_name} from ${old_role} to ${member.role} faction ${faction.name}`,
		};
	}
	return {
		ok: false,
		message: "Faction not found",
	};
};
