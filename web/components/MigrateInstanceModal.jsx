import React, { useContext, useState } from "react";
import { Modal, Form, Select } from "antd";

import { ControlContext, useInstance, useHosts } from "@clusterio/web_ui";

import MigrateInstanceRequest from "../../src/instance_migration/info/MigrateInstanceRequest";

export default function MigrateInstanceModal(props) {
	const control = useContext(ControlContext);
	let [isWorking, setWorking] = useState(false);
	let [hostList] = useHosts();
	let [form] = Form.useForm();
	const targetHost = Form.useWatch("host", form);

	function closeAndReset() {
		setWorking(false);
		props.hideModal();
	}

	return <Modal
		title="Migrate instance"
		open={props.open}
		onCancel={() => {
			if (isWorking) {
				document.location = document.location;
			} else {
				props.hideModal();
			}
		}}
		okText="Migrate instance"
		okButtonProps={{ disabled: targetHost === undefined }}
		onOk={async () => {
			if (targetHost === undefined) {
				props.hideModal();
				return;
			}

			setWorking(true);
			await control.send(new MigrateInstanceRequest(
				props.instanceId,
				targetHost,
			));
			await new Promise(resolve => setTimeout(resolve, 1000));
			closeAndReset();
		}}
		confirmLoading={isWorking}
		destroyOnClose
	>
		<p>Migrate an instance to a different host</p>
		<p>
			The migration process will stop the instance for the duration of the transfer. Ensure the target host has enabled
			the same plugins as the source host.
		</p>
		<Form form={form} initialValues={{ host: props.hostId }}>
			<Form.Item name="host" label="Target host" rules={[{ required: true, message: "Please select a host" }]}>
				<Select showSearch placeholder="Select a host" optionFilterProp="children">
					{Array.from(hostList.values()).map(host => <Select.Option
						key={host.id}
						value={host.id}>
						{host.name}
						{!host.connected && " (offline)"}
					</Select.Option>)}
				</Select>
			</Form.Item>
		</Form>
	</Modal>;
}
