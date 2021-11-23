import React, { useEffect, useContext, useState } from "react";
import { ControlContext, useInstanceList } from "@clusterio/web_ui";
import { libLogging } from "@clusterio/lib";

import info from "../../info";

const { logger } = libLogging;

export function useMapData(id) {
	let [instances] = useInstanceList();
	let control = useContext(ControlContext);
	let [mapData, setMapData] = useState({ loading: true });

	function updateMapData() {
		info.messages.getMapData.send(control).then(result => {
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
