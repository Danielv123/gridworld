import React, { useContext, useState } from "react";
import { Tooltip, Progress, Modal, Button } from "antd";

import { ControlContext, PageLayout, useInstanceList, useAccount, notifyErrorHandler } from "@clusterio/web_ui";
import info from "../../info";
import ThrottledPromise from "../lib/ThrottledPromise";

export default function RefreshTileDataModal(props) {
	const control = useContext(ControlContext);
	let [instanceList] = useInstanceList();
	let [isWorking, setWorking] = useState(false);
	let [percent, setPercent] = useState(0); // Completed + in progress
	let [success, setSuccess] = useState(0); // Completed

	function closeAndReset() {
		setWorking(false);
		setPercent(0);
		setSuccess(0);
		props.hideModal();
	}

	return <Modal
		title="Refresh tiles"
		visible={props.visible}
		onCancel={() => {
			if (isWorking) {
				document.location = document.location;
			} else {
				props.hideModal();
			}
		}}
		okText="Refresh tiles"
		onOk={async () => {
			setWorking(true);
			let total = instanceList.length;
			let completed = 0;
			let promises = [];
			for (let instance of instanceList) {
				promises.push(new ThrottledPromise(async (resolve) => {
					console.log("Refreshing tiles for instance", instance.id);
					setPercent((completed + 1) / total * 100);
					try {
						await info.messages.refreshTileData.send(control, { instance_id: instance.id });
					} catch (e) {
						notifyErrorHandler(e);
					}
					completed += 1;
					setSuccess(completed / total * 100);
					console.log("Refreshed tiles for instance", instance.id);
					return resolve();
				}));
			};
			await ThrottledPromise.all(promises, 6);
			setSuccess(100);
			await new Promise(resolve => setTimeout(resolve, 1000));
			closeAndReset();
		}}
		confirmLoading={isWorking}
	>
		<p>This will refresh the map tiles of all instances. This can take a while.</p>
		<p>
			Leaving the page while the operation is running will complete the current instance but stop
			processing the rest.
		</p>
		{isWorking ? <Progress percent={Math.floor(percent)} success={{ percent: Math.floor(success) }} /> : ""}
	</Modal>;
}
