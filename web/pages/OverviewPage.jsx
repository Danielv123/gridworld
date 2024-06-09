import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Popconfirm, Dropdown, Typography } from "antd";
import GithubOutlined from "@ant-design/icons/GithubOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";

import * as lib from "@clusterio/lib";
import { ControlContext, PageLayout, PageHeader, useInstances, useAccount, notifyErrorHandler } from "@clusterio/web_ui";
import "../index.css";
import GridVisualizer from "../components/GridVisualizer";
import RefreshTileDataButton from "../components/RefreshTileDataButton";
import useGridworlds from "../providers/useGridworlds";

function OverviewPage() {
	const control = useContext(ControlContext);
	const navigate = useNavigate();
	let [instanceList] = useInstances();
	let account = useAccount();
	const gridworlds = useGridworlds();
	const [grid_id, setGrid_id] = useState(gridworlds.size > 0 ? gridworlds.values().next().value.id : undefined);

	// Set the grid_id to the first gridworld once gridworlds have loaded if it is not set
	if (grid_id === undefined && gridworlds.size > 0) {
		setGrid_id(gridworlds.values().next().value.id);
	}

	return <PageLayout nav={[{ name: "Gridworld" }]}>
		<PageHeader
			title={<Dropdown menu={{
				items: [...gridworlds.values()].map(gridworld => ({
					label: `${gridworld.name_prefix} ${gridworld.id}`,
					key: gridworld.id,
					onClick: () => setGrid_id(gridworld.id),
				})),
			}}>
				<Typography.Title level={2}>
					{gridworlds.get(grid_id)?.name_prefix || "Gridworld"}
					<span style={{
						fontSize: "9pt",
						fontStyle: "italic",
					}}>
						{grid_id}
					</span>
				</Typography.Title>
			</Dropdown>}
			subTitle={<Button href="https://github.com/danielv123/gridworld"><GithubOutlined /></Button>}
			extra={[
				<Button
					key="1"
					// href="/gridworld/create"
					onClick={() => navigate("/gridworld/create")}
					type="primary"
				>Create new gridworld</Button>,
				account.hasPermission("core.instance.delete")
				&& <Popconfirm
					key="delete"
					title="Permanently delete ALL instances and server saves?"
					okText="Delete"
					placement="bottomRight"
					okButtonProps={{ danger: true }}
					onConfirm={async () => {
						instanceList.forEach(instance => {
							control.send(new lib.InstanceDeleteRequest(instance.id))
								.catch(notifyErrorHandler("Error deleting instance"));
						});
					}}
				>
					<Button
						danger
					>
						<DeleteOutlined />
					</Button>
				</Popconfirm>,
				<RefreshTileDataButton key="refresh" />,
				account.hasPermission("gridworld.merge.start")
				&& <Button key="merge_map" onClick={() => navigate("/gridworld/merge_map")}>Merge map</Button>,
			]}
		/>
		<p>This plugin handles creation, configuration and management of gridworlds.</p>
		<p>A gridworld is a set of factorio servers of a limited size connected together by edge_transports. Edge
			transports allows you to seamlessly run belts between the servers. Integration with server_select
			facilitates teleportation from the edge of one server to the corresponding edge of the next server.</p>
		<GridVisualizer grid_id={grid_id} />
	</PageLayout>;
}

export default OverviewPage;
