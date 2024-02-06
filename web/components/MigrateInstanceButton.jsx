import React from "react";
import { Button } from "antd";

import { useAccount } from "@clusterio/web_ui";
import MigrateInstanceModal from "./MigrateInstanceModal";

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
			open={modal}
			hideModal={() => showModal(false)}
			instanceId={props.instanceId}
		/>,
	];
}
