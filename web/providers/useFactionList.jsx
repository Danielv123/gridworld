import React, { useEffect, useState } from "react";

export default function useFactionList(control) {
	let plugin = control.plugins.get("gridworld");
	let [factions, setFactions] = useState([...plugin.factions]);

	useEffect(() => {
		function update(faction) {
			plugin.factions.set(faction.faction_id, faction);
			setFactions([...plugin.factions]);
		}

		const updateHandler = {
			callback: update,
			type: "faction_list",
		};
		plugin.onUpdate(updateHandler);
		return () => {
			plugin.offUpdate(updateHandler);
		};
	}, []);
	return factions.map(x => x[1]);
}
