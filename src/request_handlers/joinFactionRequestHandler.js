"use strict";
module.exports = async function joinFactionEventHandler(message) {
	let player = message.data.player_name;
	let faction_id = message.data.faction_id;

	let faction = this.factionsDatastore.get(faction_id);
	if (!faction) {
		return {
			ok: false,
			message: "Faction not found",
		};
	}

	// Check that the player is not already in the faction
	let targetMember = faction.members.find(m => m.name.toLowerCase() === player.toLowerCase());
	if (targetMember) {
		return {
			ok: false,
			message: "Player is already in faction",
		};
	}

	// Check if the player is allowed to join the faction
	if (!faction.open) {
		// Check if the player is invited
		let member = faction.members.find(m => m.name.toLowerCase() === player.toLowerCase());
		if (member.role !== "invited") {
			return {
				ok: false,
				message: "Player is not invited to faction",
			};
		}
	}

	// Make player leave their old faction
	for (let oldFaction of this.factionsDatastore.values()) {
		let member = oldFaction.members.find(m => m.name.toLowerCase() === player.toLowerCase());
		if (member) {
			oldFaction.members.splice(oldFaction.members.indexOf(member), 1);
			this.broadcastEventToSlaves(this.info.messages.factionUpdate, { faction: oldFaction });
			for (let sub of this.subscribedControlLinks) {
				if (sub.faction_list) { this.info.messages.factionUpdate.send(sub.link, { faction: oldFaction }); }
			}
		}
	}

	// Make player join new faction
	if (targetMember && targetMember.role === "invited") {
		targetMember.role = "member";
		if (targetMember.promotion) {
			targetMember.role = member.promotion;
			targetMember.promotion = "member";
		}
	} else {
		faction.members.push({
			name: player,
			role: "member",
		});
	}

	// Propagate changes to all online instances
	this.broadcastEventToSlaves(this.info.messages.factionUpdate, { faction: faction });

	// Propagate changes to listening web clients
	for (let sub of this.subscribedControlLinks) {
		if (sub.faction_list) { this.info.messages.factionUpdate.send(sub.link, { faction: faction }); }
	}

	return {
		ok: true,
		message: `Player ${player} joined faction ${faction.name}`,
	};
};
