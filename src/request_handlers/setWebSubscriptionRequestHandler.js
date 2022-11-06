"use strict";

async function transmitInitialFactionsData(master, link) {
	// Transmit a full copy of the data to the new client
	for (let [id, faction] of master.factionsDatastore) {
		await master.info.messages.factionUpdate.send(link, { faction });
	}
}

async function transmitInitialPlayerPositionsData(master, link) {
	// Transmit a full copy of the data to the new client
	// for (let [id, player] of master.gridworldDatastore) {
	//  await master.info.messages.playerPositionUpdate.send(link, { player });
	// }
}

module.exports = async function setWebSubscriptionRequestHandler(message, request, link) {
	let existingLink = this.subscribedControlLinks.find((sub) => sub.link === link);
	if (message.data.player_position || message.data.faction_list) {
		// Check if this link is already subscribed
		if (existingLink) {
			// Transmit initial data if the client is newly subscribing to this data
			if (message.data.player_position && !existingLink.player_position) {
				await transmitInitialPlayerPositionsData(this, link);
			}
			if (message.data.faction_list && !existingLink.faction_list) {
				await transmitInitialFactionsData(this, link);
			}

			// Update existing subscription
			existingLink.player_position = message.data.player_position;
			existingLink.faction_list = message.data.faction_list;
		} else {
			// Add new subscription
			await transmitInitialPlayerPositionsData(this, link);
			await transmitInitialFactionsData(this, link);
			this.subscribedControlLinks.push({
				link,
				player_position: message.data.player_position,
				faction_list: message.data.faction_list,
			});
		}
	} else {
		// Remove existing subscription
		this.subscribedControlLinks.splice(this.subscribedControlLinks.indexOf(existingLink), 1);
	}
};
