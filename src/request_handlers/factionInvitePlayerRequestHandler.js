"use strict";
module.exports = async function factionInvitePlayerRequestHandler(message, request, link) {
	const faction = this.factionsDatastore.get(message.data.faction_id);
	if (faction) {
		// Check if the player is already in the faction
		for (let member of faction.members) {
			if (member.name.toLowerCase() === message.data.player_name.toLowerCase()) {
				return {
					ok: false,
					message: "Player is already in the faction",
				};
			}
		}

		// Add the player to the faction
		faction.members.push({
			name: message.data.player_name,
			role: "invited",
			promotion: message.data.role,
		});

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
			message: `Invited ${message.data.player_name} to faction ${faction.name}`,
		};
	}
	return {
		ok: false,
		message: "Faction not found",
	};
};
