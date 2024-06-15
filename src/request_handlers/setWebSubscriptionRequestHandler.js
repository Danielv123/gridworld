"use strict";

const messages = require("../../messages");

async function transmitInitialFactionsData(controller, link) {
	// Transmit a full copy of the data to the new client
	for (let [id, faction] of controller.factionsDatastore) {
		controller.controller.sendTo(link, new messages.FactionUpdate({ faction }));
	}
}

async function transmitInitialPlayerPositionsData(controller, link) {
	// TODO: Transmit a full copy of the data to the new client
	// for (let [id, player] of controller.gridworldDatastore) {
	//  await controller.info.messages.playerPositionUpdate.send(link, { player });
	// }
}

async function transmitInitialGridworldsData(controller, link) {
	// Transmit a full copy of the data to the new client
	controller.controller.sendTo(link, new messages.GridworldUpdates([...controller.gridworldDatastore.values()]));
}

module.exports = async function setWebSubscriptionRequestHandler(message, link) {
	let existingLink = this.subscribedControlLinks.find((sub) => sub.link === link);
	if (message.data.player_position || message.data.faction_list || message.data.gridworlds) {
		// Check if this link is already subscribed
		if (existingLink) {
			// Transmit initial data if the client is newly subscribing to this data
			if (message.data.player_position && !existingLink.player_position) {
				await transmitInitialPlayerPositionsData(this, link);
			}
			if (message.data.faction_list && !existingLink.faction_list) {
				await transmitInitialFactionsData(this, link);
			}
			if (message.data.gridworlds && !existingLink.gridworlds) {
				await transmitInitialGridworldsData(this, link);
			}

			// Update existing subscription
			existingLink.player_position = message.data.player_position;
			existingLink.faction_list = message.data.faction_list;
			existingLink.gridworlds = message.data.gridworlds;
		} else {
			// Add new subscription
			if (message.data.player_position) {
				await transmitInitialPlayerPositionsData(this, link);
			}
			if (message.data.faction_list) {
				await transmitInitialFactionsData(this, link);
			}
			if (message.data.gridworlds) {
				await transmitInitialGridworldsData(this, link);
			}

			this.subscribedControlLinks.push({
				link,
				player_position: message.data.player_position,
				faction_list: message.data.faction_list,
				gridworlds: message.data.gridworlds,
			});
		}
	} else {
		// Remove existing subscription
		this.subscribedControlLinks.splice(this.subscribedControlLinks.indexOf(existingLink), 1);
	}
};
