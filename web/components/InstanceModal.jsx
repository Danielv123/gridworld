import React, { useContext } from "react";
import { Button, Descriptions, Space, Popconfirm, Typography, Tabs } from "antd";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import { useNavigate } from "react-router-dom";

import {
	ControlContext,
	useInstance,
	useHost,
	useAccount,
	InstanceStatusTag,
	StartStopInstanceButton,
	SavesList,
	InstanceRcon,
	LogConsole,
	InstanceConfigTree,
} from "@clusterio/web_ui";
import * as lib from "@clusterio/lib";

import MigrateInstanceButton from "./MigrateInstanceButton";

function InstanceModal(props) {
	let control = useContext(ControlContext);
	let [instance] = useInstance(props.instance_id);
	let [host] = useHost(instance?.["assigned_host"]);
	let account = useAccount();
	let navigate = useNavigate();

	return <>
		{props.instance_id && <>
			<Descriptions
				bordered
				size="small"
				title={instance["name"]}
				extra={<Space>
					{
						account.hasAnyPermission("core.instance.start", "core.instance.stop")
						&& <StartStopInstanceButton instance={instance} />
					}
					{account.hasPermission("gridworld.migrate_instance") && <MigrateInstanceButton instanceId={instance.id} />}
					{account.hasPermission("core.instance.delete") && <Popconfirm
						title="Permanently delete instance and server saves?"
						okText="Delete"
						placement="bottomRight"
						okButtonProps={{ danger: true }}
						onConfirm={() => {
							control.sendTo("controller",
								new lib.InstanceDeleteRequest(instance.id)
							).then(() => {
								navigate("/instances");
							}).catch(notifyErrorHandler("Error deleting instance"));
						}}
					>
						<Button
							danger
							disabled={!["unknown", "unassigned", "stopped"].includes(instance["status"])}
						>
							<DeleteOutlined />
						</Button>
					</Popconfirm>}
				</Space>}
			>
				<Descriptions.Item label="Host">
					{!instance.assigned_host
						? <em>Unassigned</em>
						: host["name"] || instance["assigned_host"]
					}
				</Descriptions.Item>
				{instance["status"] && <Descriptions.Item label="Status">
					<InstanceStatusTag status={instance["status"]} />
				</Descriptions.Item>}
			</Descriptions>
			<Tabs
				defaultActiveKey="console"
				items={[
					{
						disabled: !account.hasAllPermission("core.instance.save.list", "core.instance.save.subscribe"),
						label: "Saves",
						key: "saves",
						children: <SavesList instance={instance} />,
					}, {
						disabled: !account.hasAnyPermission("core.log.follow", "core.instance.send_rcon"),
						label: "Console",
						key: "console",
						children: <div>
							<Typography.Title level={5} style={{ marginTop: 16 }}>Console</Typography.Title>
							{account.hasPermission("core.log.follow") && <LogConsole instances={[props.instance_id]} />}
							{account.hasPermission("core.instance.send_rcon")
								&& <InstanceRcon id={props.instance_id} disabled={instance["status"] !== "running"} />}
						</div>,
					}, {
						disabled: !account.hasPermission("core.instance.get_config"),
						label: "Config",
						key: "config",
						children: <InstanceConfigTree id={props.instance_id} />,
					},
				]}
			/>
		</>}
	</>;
}

export default InstanceModal;
