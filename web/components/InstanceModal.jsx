import React from "react";
import { Button, Descriptions, Space, Popconfirm, Typography, Tabs } from "antd";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";

import {
	useInstance,
	useSlave,
	useAccount,
	InstanceStatusTag,
	StartStopInstanceButton,
	SavesList,
	InstanceRcon,
	LogConsole,
	InstanceConfigTree,
} from "@clusterio/web_ui";

function InstanceModal(props) {
	let [instance] = useInstance(props.instance_id);
	let [slave] = useSlave(instance["assigned_slave"]);
	let account = useAccount();

	return <>
		{props.instance_id && <>
			<Descriptions
				loading={props.instance_id !== instance.id}
				bordered
				size="small"
				title={instance["name"]}
				extra={<Space>
					{
						account.hasAnyPermission("core.instance.start", "core.instance.stop")
                        && <StartStopInstanceButton instance={instance} />
					}
					{account.hasPermission("core.instance.delete") && <Popconfirm
						title="Permanently delete instance and server saves?"
						okText="Delete"
						placement="bottomRight"
						okButtonProps={{ danger: true }}
						onConfirm={() => {
							libLink.messages.deleteInstance.send(
								control, { instance_id: instanceId }
							).then(() => {
								history.push("/instances");
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
				<Descriptions.Item label="Slave">
					{!instance.assigned_slave
						? <em>Unassigned</em>
						: slave["name"] || instance["assigned_slave"]
					}
				</Descriptions.Item>
				{instance["status"] && <Descriptions.Item label="Status"><InstanceStatusTag status={instance["status"]} /></Descriptions.Item>}
			</Descriptions>
			<Tabs defaultActiveKey="1">
				{
					account.hasAllPermission("core.instance.save.list", "core.instance.save.list_subscribe")
                    && <Tabs.TabPane tab="Saves" key="saves">
                    	<SavesList instance={instance} />
                    </Tabs.TabPane>
				}
				{
					account.hasAnyPermission("core.log.follow", "core.instance.send_rcon")
                    && <Tabs.TabPane tab="Console" key="console">
                    	<Typography.Title level={5} style={{ marginTop: 16 }}>Console</Typography.Title>
                    	{account.hasPermission("core.log.follow") && <LogConsole instances={[props.instance_id]} />}
                    	{account.hasPermission("core.instance.send_rcon") && <InstanceRcon id={props.instance_id} disabled={instance["status"] !== "running"} />}
                    </Tabs.TabPane>
				}
				{
					account.hasPermission("core.instance.get_config")
                    && <Tabs.TabPane tab="Config" key="config">
                    	<InstanceConfigTree id={props.instance_id} />
                    </Tabs.TabPane>
				}
			</Tabs>
		</>}
	</>;
}

export default InstanceModal;
