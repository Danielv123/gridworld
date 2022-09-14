import React, { useContext, useState } from "react";
import { Progress, Modal, InputNumber } from "antd";

import { ControlContext, useInstanceList, notifyErrorHandler } from "@clusterio/web_ui";
import info from "../../info";
import ThrottledPromise from "../lib/ThrottledPromise";

export default function RefreshTileDataModal(props) {
	const control = useContext(ControlContext);
	let [instanceList] = useInstanceList();
	let [isWorking, setWorking] = useState(false);
	let [percent, setPercent] = useState(0); // Completed + in progress
	let [success, setSuccess] = useState(0); // Completed
	let [chartThreads, setChartThreads] = useState(1);

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
			let inProgress = 0;
			let promises = [];
			for (let instance of instanceList) {
				if (instance.name.toLowerCase().includes("lobby server")) {
					total -= 1;
					continue;
				}
				// eslint-disable-next-line
				promises.push(new ThrottledPromise(async (resolve) => {
					inProgress += 1;
					setPercent((completed + inProgress) / total * 100);
					try {
						await info.messages.refreshTileData.send(control, { instance_id: instance.id });
					} catch (e) {
						notifyErrorHandler(e);
					}
					completed += 1;
					inProgress -= 1;
					setSuccess(completed / total * 100);
					return resolve();
				}));
			};
			await ThrottledPromise.all(promises, chartThreads);
			setSuccess(100);
			await new Promise(resolve => setTimeout(resolve, 1000));
			closeAndReset();
		}}
		confirmLoading={isWorking}
	>
		<p>This will refresh the map tiles of all instances. This can take a while.</p>
		<p>
			Leaving the page while the operation is running will complete the current instance but stop
			processing the rest. Using multiple threads will speed up the operation, but will use a lot
			of memory. The memory usage will be approximately <code>{chartThreads * 2} GB</code>.
		</p>
		{isWorking
			? <Progress percent={Math.floor(percent)} success={{ percent: Math.floor(success) }} />
			: <InputNumber defaultValue={chartThreads} onChange={setChartThreads} />
		}
	</Modal>;
}
