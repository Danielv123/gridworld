"use strict";
module.exports = async function setPlayerPositionSubscriptionRequestHandler(message, request, link) {
	if (message.data.player_position) {
		this.subscribedControlLinks.add(link);
	} else {
		this.subscribedControlLinks.delete(link);
	}
};
