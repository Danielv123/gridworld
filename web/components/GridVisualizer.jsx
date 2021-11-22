import React, { useContext, useState } from "react";
import { Row, Col } from "antd";
import { Map, Polyline, Rectangle, Tooltip } from "react-leaflet";

import { ControlContext, useInstance, statusColors } from "@clusterio/web_ui";
import { useMapData } from "../model/mapData";
import InstanceTooltip from "./InstanceTooltip";
import InstanceModal from "./InstanceModal";

function getBounds(points) {
	let minX = points.sort((a, b) => a[1] - b[1])[0][1];
	let minY = points.sort((a, b) => a[0] - b[0])[0][0];
	let maxX = points.sort((a, b) => b[1] - a[1])[0][1];
	let maxY = points.sort((a, b) => b[0] - a[0])[0][0];
	return [[maxY, minX], [minY, maxX]];
}

export default function GridVisualizer(props) {
	const control = useContext(ControlContext);
	const [mapData] = useMapData();
	const [activeInstance, setActiveInstance] = useState();

	return <>
		<div className="grid-visualizer">
			<link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
				// eslint-disable-next-line max-len
				integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
				crossOrigin="" />
			<script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"
				// eslint-disable-next-line max-len
				integrity="sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA=="
				crossOrigin=""></script>

			<Row>
				<Col lg={24} xl={12}>
					{mapData.map_data?.length ? <Map
						// center={[-1, 2]}
						// zoom={7}
						scrollWheelZoom={true}
						style={{ width: "100%", height: "700px", backgroundColor: "#141414" }}
						attributionControl={false}
						bounds={getBounds(mapData.map_data?.map?.(
							instance => instance.bounds.map(position => [-1 * position[1] / 100, position[0] / 100])
						).flat() ?? [])}
					>
						{mapData?.map_data?.map?.(instance => <div key={instance.instance_id}>
							{instance.edges.map(edge => {
								// Coordinates are given as lat and long corresponding to Y and X in the grid
								let origin = [-1 * edge.origin[1] / 100, edge.origin[0] / 100];
								let destination = [...origin];
								if (edge.direction === 0) { destination[1] += edge.length / 100; }
								if (edge.direction === 4) { destination[1] -= edge.length / 100; }
								if (edge.direction === 2) { destination[0] -= edge.length / 100; }
								if (edge.direction === 6) { destination[0] += edge.length / 100; }
								return <Polyline
									key={`${instance.instance_id}${edge.id}`}
									positions={[origin, destination]}
									opacity={0.3}
								/>;
							})}
							<InstanceRender
								instance={instance}
								activeInstance={activeInstance}
								setActiveInstance={setActiveInstance}
							/>
						</div>
						)}
					</Map> : ""}
				</Col>
				<Col xs={24} sm={12}>
					<InstanceModal instance_id={activeInstance} />
				</Col>
			</Row>
		</div>
	</>;
}

function InstanceRender(props) {
	const [instance] = useInstance(props.instance.instance_id);

	return <Rectangle
		bounds={getBounds(props.instance.bounds.map(position => [-1 * position[1] / 100, position[0] / 100]))}
		onclick={() => {
			props.setActiveInstance(props.instance.instance_id);
		}}
		color={props.instance.instance_id === props.activeInstance ? "#ffff00" : "#3388ff"}
		fillColor={statusColors[instance.status]}
		opacity={0.5}
		stroke={props.instance.instance_id === props.activeInstance}
	>
		<Tooltip direction="center">
			<InstanceTooltip instance_id={props.instance.instance_id} />
		</Tooltip>
	</Rectangle>;
}
