import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ControlContext, useHosts } from "@clusterio/web_ui";

import "../index.css";
import { Form, Input, Button, Select, InputNumber, Checkbox } from "antd";
import messages from "../../messages";
const { Option } = Select;

const layout = {
	labelCol: { span: 8 },
	wrapperCol: { span: 16 },
};
const tailLayout = {
	wrapperCol: { offset: 8, span: 16 },
};

function NewGridworldForm() {
	let navigate = useNavigate();
	let control = useContext(ControlContext);
	let [loading, setLoading] = useState();
	let [hosts] = useHosts();

	async function onFinish(values) {
		setLoading(true);
		await control.send(new messages.CreateFactionGrid(values));
		setLoading(false);
		await new Promise(resolve => setTimeout(resolve, 1500));
		navigate("/gridworld");
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
			name="host"
			label="Host to create lobby instance on"
			rules={[{ required: true }]}
		>
			<Select
				placeholder="Select host"
			>
				{[...hosts?.keys()].map(key => hosts.get(key)).map?.(host => <Option key={host.id} value={host.id}>{host.name}</Option>)}
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
