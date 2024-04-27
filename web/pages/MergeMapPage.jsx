import { useContext } from "react";
import { PageHeader, PageLayout, useHosts, ControlContext } from "@clusterio/web_ui";
import { Form, Button, Select } from "antd";
import useGridworlds from "../providers/useGridworlds";
import gridworld from "../..";
import messages from "../../messages";

export default function MergeMapPage() {
	const control = useContext(ControlContext);
	const [hosts] = useHosts();
	const gridworlds = useGridworlds(control);

	return <PageLayout nav={[{ name: "Gridworld", path: "/gridworld" }, { name: "merge_map" }]}>
		<PageHeader
			className="site-page-header"
			title="Merge map"
		/>
		<Form
			onFinish={async values => {
				await control.send(new messages.StartMapMerge({
					host_id: values.host_id,
					grid_id: values.grid_id,
				}));
			}}
		>
			<Form.Item
				label="Host to use for merge"
				name="host_id"
			>
				<Select>
					{[...hosts?.keys()]
						.map(key => hosts.get(key))
						.map(host => <Select.Option key={host.id} value={host.id}>{host.name}</Select.Option>)}
				</Select>
			</Form.Item>
			<Form.Item
				label="Grid ID to merge"
				name="grid_id"
			>
				<Select>
					{[...gridworlds?.keys()]
						.map(key => gridworlds.get(key))
						.map(grid => <Select.Option key={`grid${grid.id}`} value={grid.id}>{grid.name_prefix}</Select.Option>)}
				</Select>
			</Form.Item>

			<Form.Item>
				<Button type="primary" htmlType="submit">
					Merge
				</Button>
			</Form.Item>
		</Form>
	</PageLayout>;
};
