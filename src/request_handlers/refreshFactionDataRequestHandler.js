"use strict";
//
// Refresh faction data for factions that have changed since the last time the instance was online.
// TODO: Implement delta updates rather than sending all data every time.
//
module.exports = async function refreshFactionDataRequestHandler(message, request, link) {
	const updatedFactions = [];

	// Get updated factions
	for (let faction of this.factionsDatastore.values()) {
		updatedFactions.push(faction);
	}

	return {
		ok: true,
		msg: "Faction data refreshed",
		factions: updatedFactions,
	};
};
