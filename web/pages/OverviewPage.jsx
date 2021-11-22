import React from "react";
import { useHistory } from "react-router-dom";
import { Button, Select, PageHeader } from "antd";
import GithubOutlined from "@ant-design/icons/GithubOutlined";

import { PageLayout, useInstanceList } from "@clusterio/web_ui";
import "../index.css";
import GridVisualizer from "../components/GridVisualizer";

const { Option } = Select;

function OverviewPage() {
	const history = useHistory();
	let [instanceList] = useInstanceList();

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