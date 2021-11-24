import React from "react";
import { Tooltip, Progress, Modal, Button } from "antd";

import { ControlContext, PageLayout, useInstanceList, useAccount, notifyErrorHandler } from "@clusterio/web_ui";
import info from "../../info";
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
