import React, { useEffect, useState } from "react";

export default function useGridworlds(control) {
	let plugin = control.plugins.get("gridworld");
	let [gridworlds, setGridworlds] = useState(new Map(plugin.gridworlds));

	useEffect(() => {
		function update(gridworld) {
			plugin.gridworlds.set(gridworld.id, gridworld);
			setGridworlds(new Map(plugin.gridworlds));
		}

		const updateHandler = {
			callback: update,
			type: "gridworlds",
		};
		plugin.onUpdate(updateHandler);
		return () => {
			plugin.offUpdate(updateHandler);
		};
	}, []);
	return gridworlds;
}
