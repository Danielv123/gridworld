"use strict";
module.exports = async function playerPositionEventHandler(message) {
	// Broadcast player position from instance to web interface
	// TODO: Save position on master and broadcast full list on connect.
	// TODO: Don't broadcast individual events unless position has changed.
	for (let link of this.subscribedControlLinks) {
		this.info.messages.playerPosition.send(link, message.data);
	}
};
