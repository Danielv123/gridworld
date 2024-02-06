import React, { useEffect, useContext, useState } from "react";
import { ControlContext, useInstances } from "@clusterio/web_ui";

import messages from "../../messages";

const { logger } = require("@clusterio/lib");

export function useMapData(id) {
	let [instances] = useInstances();
	let control = useContext(ControlContext);
	let [mapData, setMapData] = useState({ loading: true });

	function updateMapData() {
		control.send(new messages.GetMapData())
			.then(result => {
				setMapData({ ...result, loading: false });
			}).catch(err => {
				logger.error(`Failed to get instance: ${err}`);
				setMapData({ missing: true });
			});
	}

	useEffect(() => {
		updateMapData();

		// Periodically update the map data since we don't listen to edge_teleports config changes
		let interval = setInterval(updateMapData, 15000);
		return () => clearInterval(interval);
	}, [id, instances.length]);

	return [mapData, updateMapData];
}
