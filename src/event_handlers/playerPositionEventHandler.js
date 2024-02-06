"use strict";

const messages = require("../../messages");

module.exports = async function playerPositionEventHandler(message) {
	// Broadcast player position from instance to web interface
	// TODO: Save position on controller and broadcast full list on connect.
	// TODO: Don't broadcast individual events unless position has changed.
	for (let sub of this.subscribedControlLinks) {
		if (sub.player_posiiton) {
			sub.link.send(new messages.PlayerPosition(message.data));
		}
	}
};
