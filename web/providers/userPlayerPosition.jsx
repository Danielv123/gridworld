import React, { useEffect, useState } from "react";

export default function usePlayerPosition(control) {
	let plugin = control.plugins.get("gridworld");
	let [playerPositions, setPlayerPositions] = useState([...plugin.playerPositions]);

	useEffect(() => {
		function update() {
			setPlayerPositions([...plugin.playerPositions]);
		}

		plugin.onUpdate(update);
		return () => {
			plugin.offUpdate(update);
		};
	}, []);
	return playerPositions;
}
