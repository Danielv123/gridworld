import React, { useContext, useState } from "react";
import { Progress, Modal, Form, Select, Spin } from "antd";

import { ControlContext, useInstance, useSlaveList, notifyErrorHandler } from "@clusterio/web_ui";
import info from "../../info";

export default function MigrateInstanceModal(props) {
	const control = useContext(ControlContext);
	let [isWorking, setWorking] = useState(false);
	let [slaveList] = useSlaveList();
	let [instance] = useInstance(props.instanceId);
	let [form] = Form.useForm();

	function closeAndReset() {
		setWorking(false);
		props.hideModal();
	}

	return <Modal
		title="Migrate instance"
		visible={props.visible}
		onCancel={() => {
			if (isWorking) {
				document.location = document.location;
			} else {
				props.hideModal();
			}
		}}
		okText="Migrate instance"
		onOk={async () => {
			let slaveId = form.getFieldValue("slave");
			if (slaveId === undefined) {
				props.hideModal();
				return;
			}

			setWorking(true);
			await info.messages.migrateInstance.send(control, {
				instance_id: props.instanceId,
				slave_id: slaveId,
			});
			await new Promise(resolve => setTimeout(resolve, 1000));
			closeAndReset();
		}}
		confirmLoading={isWorking}
		destroyOnClose
	>
		<p>Migrate an instance to a different slave</p>
		<p>
			The migration process will stop the instance for the duration of the transfer. Ensure the target slave has enabled
			the same plugins as the source slave.
		</p>
		<Form form={form} initialValues={{ slave: props.slaveId }}>
			<Form.Item name="slave" label="Target slave" rules={[{ required: true, message: "Please select a slave" }]}>
				<Select showSearch placeholder="Select a slave" optionFilterProp="children">
					{slaveList.map(slave => <Select.Option
						key={slave.id}
						value={slave.id}>
						{slave.name}
						{!slave.connected && " (offline)"}
					</Select.Option>)}
				</Select>
			</Form.Item>
		</Form>
	</Modal>;
}
