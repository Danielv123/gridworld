"use strict";
const { libLink } = require("@clusterio/lib");

module.exports = async function startInstanceRequestHandler(message, request, link) {
	return libLink.messages.startInstance.send(link, message.data);
};
