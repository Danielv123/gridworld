import React from "react";
import { Button } from "antd";

import { useAccount } from "@clusterio/web_ui";
import RefreshTileDataModal from "./RefreshTileDataModal";

export default function RefreshTileDataButton() {
	const account = useAccount();
	const [modal, showModal] = React.useState(false);
	return [
		account.hasPermission("gridworld.map.refresh") ? <Button
			key="refreshTileData"
			onClick={() => showModal(true)}
		>
			Refresh tiles
		</Button> : "",
		<RefreshTileDataModal
			key="modal"
			visible={modal}
			hideModal={() => showModal(false)}
		/>,
	];
}
