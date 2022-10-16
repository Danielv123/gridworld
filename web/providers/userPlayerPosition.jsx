import React, { useEffect, useState } from "react";

export default function usePlayerPosition(control) {
	let plugin = control.plugins.get("gridworld");
	let [playerPositions, setPlayerPositions] = useState([...plugin.playerPositions]);

	useEffect(() => {
		function update(player) {
			plugin.playerPositions.set(player.player_name, player);
			setPlayerPositions([...plugin.playerPositions]);
		}

		const updateHandler = {
			callback: update,
			type: "player_position",
		};
		plugin.onUpdate(updateHandler);
		return () => {
			plugin.offUpdate(updateHandler);
		};
	}, []);
	return playerPositions;
}
