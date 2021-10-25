import React, { useContext, useEffect, useState } from "react";

import { libPlugin } from "@clusterio/lib";
import { PageLayout, ControlContext } from "@clusterio/web_ui";
import info from "../info";

import "./index.css";
import { Form, Input, Button, Select, InputNumber, Checkbox } from 'antd';
const { Option } = Select;

const layout = {
	labelCol: { span: 8 },
	wrapperCol: { span: 16 },
};
const tailLayout = {
	wrapperCol: { offset: 8, span: 16 },
};

function OverviewPage() {
	let control = useContext(ControlContext);
	let [loading, setLoading] = useState();

	const onFinish = async (values) => {
		console.log('Success:', values);
		setLoading(true);
		await info.messages.create.send(control, values)
		setLoading(false);
	};

	const onFinishFailed = (errorInfo) => {
		console.log('Failed:', errorInfo);
		setLoading(false);
	};

	return <PageLayout nav={[{ name: "Gridworld" }]}>
		<h2>Gridworld</h2>
		<Form
			name="basic"
			{...layout}
			initialValues={{ name_prefix: "Gridworld", use_edge_transports: true, x_size: 500, y_size: 500, x_count: 2, y_count: 2 }}
			onFinish={onFinish}
			onFinishFailed={onFinishFailed}
			autoComplete="off"
		>
			<Form.Item name="name_prefix" label="Instance name prefix" rules={[{ type: 'string' }]}>
				<Input />
			</Form.Item>
			<Form.Item name="use_edge_transports" label="Use edge transports" valuePropName="checked">
				<Checkbox />
			</Form.Item>
			<Form.Item name={"x_size"} label="World size along X axis" rules={[{ type: 'number', min: 0, max: 10000 }]}>
				<InputNumber />
			</Form.Item>
			<Form.Item name={"y_size"} label="World size along Y axis" rules={[{ type: 'number', min: 0, max: 10000 }]}>
				<InputNumber />
			</Form.Item>
			<Form.Item name={"x_count"} label="Number of servers on X axis" rules={[{ type: 'number', min: 0, max: 100 }]}>
				<InputNumber />
			</Form.Item>
			<Form.Item name={"y_count"} label="Number of servers on Y axis" rules={[{ type: 'number', min: 0, max: 100 }]}>
				<InputNumber />
			</Form.Item>

			<Form.Item {...tailLayout}>
				<Button type="primary" htmlType="submit" loading={loading}>
					Create gridworld
				</Button>
			</Form.Item>
		</Form>
	</PageLayout>;
}

export class WebPlugin extends libPlugin.BaseWebPlugin {
	async init() {
		this.pages = [
			{
				path: "/gridworld/overview",
				sidebarName: "Gridworld",
				permission: "gridworld.overview.view",
				content: <OverviewPage />,
			},
		];
	}

	onMasterConnectionEvent(event) {
		if (event === "connect") {

		}
	}
}
