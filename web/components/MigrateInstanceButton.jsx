import React from "react";
import { Tooltip, Progress, Modal, Button } from "antd";

import { ControlContext, PageLayout, useInstanceList, useAccount, notifyErrorHandler } from "@clusterio/web_ui";
import info from "../../info";
import MigrateInstanceModal from "./MigrateInstanceModal";
import { ProgressPlugin } from "webpack";

export default function MigrateInstanceButton(props) {
	const account = useAccount();
	const [modal, showModal] = React.useState(false);
	return [
		account.hasPermission("gridworld.migrate_instance") ? <Button
			key="migrateInstanceButton"
			onClick={() => showModal(true)}
		>
			Migrate
		</Button> : "",
		<MigrateInstanceModal
			key="modal"
			visible={modal}
			hideModal={() => showModal(false)}
			instanceId={props.instanceId}
		/>,
	];
}
