import React, { useContext, useEffect, useState } from "react";
import { ControlContext } from "@clusterio/web_ui";

export default function useGridworlds() {
	const control = useContext(ControlContext);
	let plugin = control.plugins.get("gridworld");
	let [gridworlds, setGridworlds] = useState(new Map(plugin.gridworlds));

	useEffect(() => {
		function update(data) {
			for (let gridworld of data.gridworlds) {
				plugin.gridworlds.set(gridworld.id, gridworld);
			}
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
