import React, { useContext, useState } from "react";
import { useHistory } from "react-router";

import { ControlContext, useSlaveList } from "@clusterio/web_ui";
import info from "../../info";

import "../index.css";
import { Form, Input, Button, Select, InputNumber, Checkbox } from "antd";
const { Option } = Select;

const layout = {
	labelCol: { span: 8 },
	wrapperCol: { span: 16 },
};
const tailLayout = {
	wrapperCol: { offset: 8, span: 16 },
};

function NewGridworldForm() {
	let history = useHistory();
	let control = useContext(ControlContext);
	let [loading, setLoading] = useState();
	let [slaveList] = useSlaveList();

	async function onFinish(values) {
		// console.log("Success:", values);
		setLoading(true);
		await info.messages.create.send(control, values);
		setLoading(false);
		await new Promise(resolve => setTimeout(resolve, 1500));
		history.push("/gridworld");
	};

	function onFinishFailed(errorInfo) {
		// console.log("Failed:", errorInfo);
		setLoading(false);
	};

	return <Form
		name="basic"
		{...layout}
		initialValues={{
			name_prefix: "Gridworld",
			use_edge_transports: true,
			x_size: 512,
			y_size: 512,
			x_count: 2,
			y_count: 2,
		}}
		onFinish={onFinish}
		onFinishFailed={onFinishFailed}
		autoComplete="off"
	>
		<Form.Item name="name_prefix" label="Instance name prefix" rules={[{ type: "string" }]}>
			<Input />
		</Form.Item>
		<Form.Item name="use_edge_transports" label="Use edge transports" valuePropName="checked">
			<Checkbox />
		</Form.Item>
		<Form.Item
			name={"x_size"}
			label="World width"
			rules={[{ required: true, type: "number", min: 0, max: 10000 }]}
		>
			<InputNumber />
		</Form.Item>
		<Form.Item
			name={"y_size"}
			label="World height"
			rules={[{ required: true, type: "number", min: 0, max: 10000 }]}
		>
			<InputNumber />
		</Form.Item>
		<Form.Item
			name={"x_count"}
			label="Number of servers on X axis"
			rules={[{ required: true, type: "number", min: 0, max: 100 }]}
		>
			<InputNumber />
		</Form.Item>
		<Form.Item
			name={"y_count"}
			label="Number of servers on Y axis"
			rules={[{ required: true, type: "number", min: 0, max: 100 }]}
		>
			<InputNumber />
		</Form.Item>
		<Form.Item
			name="slave"
			label="Slave to create instances on"
			rules={[{ required: true }]}
		>
			<Select
				placeholder="Select slave"
			>
				{slaveList.map(slave => <Option key={slave.id} value={slave.id}>{slave.name}</Option>)}
			</Select>
		</Form.Item>

		<Form.Item {...tailLayout}>
			<Button type="primary" htmlType="submit" loading={loading}>
				Create gridworld
			</Button>
		</Form.Item>
	</Form>;
}

export default NewGridworldForm;
