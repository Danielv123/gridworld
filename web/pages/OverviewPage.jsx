import React, { useContext } from "react";
import { useHistory } from "react-router-dom";
import { Button, PageHeader, Popconfirm } from "antd";
import GithubOutlined from "@ant-design/icons/GithubOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";

import { libLink } from "@clusterio/lib";
import { ControlContext, PageLayout, useInstanceList, useAccount, notifyErrorHandler } from "@clusterio/web_ui";
import "../index.css";
import GridVisualizer from "../components/GridVisualizer";
import info from "../../info";

function OverviewPage() {
	const control = useContext(ControlContext);
	const history = useHistory();
	let [instanceList] = useInstanceList();
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
					onClick={() => history.push("/gridworld/create")}
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
							libLink.messages.deleteInstance.send(
								control, { instance_id: instance.id }
							).catch(notifyErrorHandler("Error deleting instance"));
						});
					}}
				>
					<Button
						danger
					>
						<DeleteOutlined />
					</Button>
				</Popconfirm>,
				<Button
					key="refreshTileData"
					onClick={async () => {
						for (let instance of instanceList) {
							// let instance = instanceList[0];
							// eslint-disable-next-line no-console
							console.log("Getting tiles for ", instance, info.messages);
							await info.messages.refreshTileData.send(control, { instance_id: instance.id });
						};
					}}
				>
					Refresh tiles
				</Button>,
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
