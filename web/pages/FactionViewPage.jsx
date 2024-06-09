import React, { useEffect, useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { Alert, Descriptions, Spin, Table } from "antd";

import { ControlContext, PageLayout, PageHeader } from "@clusterio/web_ui";
import useFactionList from "../providers/useFactionList";

export default function FactionViewPage() {
	const params = useParams();
	const control = useContext(ControlContext);
	const factions = useFactionList(control);
	const faction = factions.find(f => f.faction_id === params.faction_id);

	const factionName = faction?.name ?? "Unknown Faction";
	let nav = [{ name: "Factions", path: "/gridworld/factions" }, { name: factionName }];
	if (!factions) {
		return <PageLayout nav={nav}>
			<Descriptions borderd size="small" title={factionName} />
			<Spin size="large" />
		</PageLayout>;
	}

	if (!faction) {
		return <PageLayout nav={nav}>
			<Descriptions bordered size="small" title={factionName}>
				<Descriptions.Item label="Faction ID">{params.faction_id}</Descriptions.Item>
			</Descriptions>
			<Alert
				style={{
					marginTop: "1em",
				}}
				message={"Error loading faction"}
				description={
					"The web interface was unable to load the faction. This is " +
					"usually due to an incorrect faction ID or a missing faction."
				}
				type="error"
				showIcon
			/>
		</PageLayout>;
	}

	return <PageLayout nav={nav}>
		<PageHeader
			title={factionName}
			subTitle={faction.about.header}
		/>
		<Descriptions bordered size="small">
			<Descriptions.Item label="ID">{params.faction_id}</Descriptions.Item>
			<Descriptions.Item label="Open" span={2}>{faction.open ? "Yes" : "No"}</Descriptions.Item>
			<Descriptions.Item label="Header" span={3}>{faction.about.header}</Descriptions.Item>
			<Descriptions.Item label="Description" span={3}>{faction.about.description}</Descriptions.Item>
			<Descriptions.Item label="Rules" span={3}>{faction.about.rules}</Descriptions.Item>
		</Descriptions>
		<PageHeader
			className="site-page-header"
			title="Members"
		/>
		<Table
			columns={[
				{
					title: "Name",
					key: "name",
					dataIndex: "name",
				},
				{
					title: "Role",
					key: "role",
					dataIndex: "role",
				},
			]}
			dataSource={faction.members}
			rowKey="name"
		/>
		<PageHeader
			className="site-page-header"
			title="Friends"
		/>
		<Table
			columns={[
				{
					title: "Name",
					key: "name",
					dataIndex: "name",
				},
			]}
			dataSource={faction.friends}
			rowKey="name"
		/>
		<PageHeader
			className="site-page-header"
			title="Enemies"
		/>
		<Table
			columns={[
				{
					title: "Name",
					key: "name",
					dataIndex: "name",
				},
			]}
			dataSource={faction.enemies}
			rowKey="name"
		/>
		<PageHeader
			className="site-page-header"
			title="Instances"
		/>
		<Table
			columns={[
				{
					title: "Name",
					key: "name",
					dataIndex: "name",
				},
				{
					title: "ID",
					key: "instance_id",
					dataIndex: "instance_id",
				},
			]}
			dataSource={faction.instances}
			rowKey="instance_id"
		/>
	</PageLayout>;
}
