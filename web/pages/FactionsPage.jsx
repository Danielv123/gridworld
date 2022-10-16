import React, { useContext } from "react";
import { useHistory } from "react-router-dom";
import { Button, PageHeader, Popconfirm, Table } from "antd";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";

import "../index.css";
import { libLink } from "@clusterio/lib";
import { ControlContext, PageLayout, useAccount, notifyErrorHandler } from "@clusterio/web_ui";
import useFactionList from "../providers/useFactionList";

function FactionsPage() {
	const control = useContext(ControlContext);
	const history = useHistory();
	const factions = useFactionList(control);
	let account = useAccount();

	return <PageLayout nav={[{ name: "Gridworld" }]}>
		<PageHeader
			className="site-page-header"
			title="Factions"
			extra={[
				account.hasPermission("gridworld.faction.delete")
				&& <Popconfirm
					key="delete"
					title="Permanently delete ALL factions?"
					okText="Delete"
					placement="bottomRight"
					okButtonProps={{ danger: true }}
					onConfirm={async () => {
						for (let faction of factions) {
							// TODO: Delete faction
						}
					}}
				>
					<Button danger>
						<DeleteOutlined />
					</Button>
				</Popconfirm>,
			]}
		/>
		<p>List of active factions in the gridworld</p>
		<Table
			columns={[
				{
					title: "Name",
					key: "name",
					render: faction => faction.name,
					defaultSortOrder: "ascend",
					sorter: (a, b) => a.name.localeCompare(b.name),
				},
				{
					title: "Members",
					key: "members",
					render: (_, faction) => faction.members.length,
				},
			]}
			dataSource={factions}
			rowKey="faction_id"
			onRow={faction => ({
				onClick: event => {
					history.push(`/gridworld/factions/${faction.faction_id}/view`);
				},
			})}
		/>
	</PageLayout>;
}

export default FactionsPage;
