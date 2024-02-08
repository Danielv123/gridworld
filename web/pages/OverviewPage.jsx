import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Popconfirm } from "antd";
import GithubOutlined from "@ant-design/icons/GithubOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";

import * as lib from "@clusterio/lib";
import { ControlContext, PageLayout, PageHeader, useInstances, useAccount, notifyErrorHandler } from "@clusterio/web_ui";
import "../index.css";
import GridVisualizer from "../components/GridVisualizer";
import RefreshTileDataButton from "../components/RefreshTileDataButton";

function OverviewPage() {
	const control = useContext(ControlContext);
	const navigate = useNavigate();
	let [instanceList] = useInstances();
	let account = useAccount();

	return <PageLayout nav={[{ name: "Gridworld" }]}>
		<PageHeader
			className="site-page-header"
			title="Gridworld"
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
			]}
		/>
		<p>This plugin handles creation, configuration and management of gridworlds.</p>
		<p>A gridworld is a set of factorio servers of a limited size connected together by edge_transports. Edge
			transports allows you to seamlessly run belts between the servers. Integration with server_select
			facilitates teleportation from the edge of one server to the corresponding edge of the next server.</p>
		<GridVisualizer instances={instanceList} />
	</PageLayout>;
}

export default OverviewPage;
