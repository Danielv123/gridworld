import React, { useContext, useState, useEffect } from "react";
import { Row, Col } from "antd";
import { MapContainer, Polyline, Rectangle, Tooltip, SVGOverlay, Popup, Circle } from "react-leaflet";
import { TileLayer as TileLayerCustom } from "./leaflet/TileLayerCustomReact";

import { ControlContext, useInstance, statusColors } from "@clusterio/web_ui";
import { useMapData } from "../model/mapData";
import InstanceTooltip from "./InstanceTooltip";
import InstanceModal from "./InstanceModal";
import usePlayerPosition from "../providers/userPlayerPosition";

function getBounds(points) {
	let minX = points.sort((a, b) => a[1] - b[1])[0][1];
	let minY = points.sort((a, b) => a[0] - b[0])[0][0];
	let maxX = points.sort((a, b) => b[1] - a[1])[0][1];
	let maxY = points.sort((a, b) => b[0] - a[0])[0][0];
	return [[maxY, minX], [minY, maxX]];
}

const scaleFactor = 2048;

export default function GridVisualizer(props) {
	const control = useContext(ControlContext);
	const playerPositions = usePlayerPosition(control);
	const [mapData] = useMapData(props.grid_id);
	const [activeInstance, setActiveInstance] = useState();
	const [refreshTiles, setRefreshTiles] = useState("1");
	const [edges] = control.plugins.get("universal_edges").useEdgeConfigs();

	useEffect(() => {
		const interval = setInterval(() => {
			setRefreshTiles(Math.floor(Math.random() * 10000).toString());
		}, 2500);
		return () => clearInterval(interval);
	}, []);

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
					{mapData.map_data?.length ? <MapContainer
						scrollWheelZoom={true}
						style={{ width: "100%", height: "700px", backgroundColor: "#141414" }}
						attributionControl={false}
						bounds={getBounds(mapData.map_data?.map?.(
							instance => instance.bounds.map(position => [
								-1 * position[1] / scaleFactor,
								position[0] / scaleFactor,
							])
						).flat() ?? [])}
						maxZoom={18}
						minZoom={7}
						crs={L.CRS.Simple}
					>
						<TileLayerCustom
							url={`${document.location.origin}/api/gridworld/tiles/{z}/{x}/{y}.png?refresh=${refreshTiles}`}
							maxNativeZoom={10} // 10 max
							minNativeZoom={10} // 7 min
						/>
						<TileLayerCustom
							url={`${document.location.origin}/api/gridworld/entities/{z}/{x}/{y}.png?refresh=${refreshTiles}`}
							maxNativeZoom={10} // 10 max
							minNativeZoom={10} // 7 min
						/>
						{[...edges.values()].map(fullEdge => ["source", "target"].map((targetKey) => {
							// Could probably save a bit of performance by not rendering both source and target when they overlap
							// TODO: Filter by only edges belonging to this grid_id
							const edge = fullEdge[targetKey];
							const length = fullEdge.length;
							// Coordinates are given as lat and long corresponding to Y and X in the grid
							let origin = [-1 * edge.origin[1] / scaleFactor, edge.origin[0] / scaleFactor];
							let destination = [...origin];
							if (edge.direction === 0) { destination[1] += length / scaleFactor; }
							if (edge.direction === 4) { destination[1] -= length / scaleFactor; }
							if (edge.direction === 2) { destination[0] -= length / scaleFactor; }
							if (edge.direction === 6) { destination[0] += length / scaleFactor; }
							return <Polyline
								key={fullEdge.id}
								positions={[origin, destination]}
								opacity={0.3}
							/>;
						}))}
						{mapData?.map_data?.map?.(instance => <div key={instance.instance_id}>
							<InstanceRender
								instance={instance}
								activeInstance={activeInstance}
								setActiveInstance={setActiveInstance}
							/>
						</div>
						)}
						{playerPositions.map(player => <PlayerRender player={player} key={player[1].player_name} />)}
					</MapContainer> : ""}
				</Col>
				<Col xs={24} sm={12} style={{ paddingLeft: "10px" }}>
					<InstanceModal instance_id={activeInstance} />
				</Col>
			</Row>
		</div>
	</>;
}

function PlayerRender(props) {
	const player = props.player[1];
	// Circle has fixed size in the world, can also use <Marker with `position` instead of `center`
	return <div>
		<Circle center={[player.y / scaleFactor * -1, player.x / scaleFactor]} radius={5 / 2048}>
			<Popup>
				{player.player_name}
			</Popup>
		</Circle>
	</div>;
}

function InstanceRender(props) {
	const [instance] = useInstance(props.instance.instance_id);
	if (instance === undefined) {
		return "";
	}
	return <Rectangle
		bounds={getBounds(props.instance.bounds.map(position => [
			-1 * position[1] / scaleFactor,
			position[0] / scaleFactor,
		]))}
		eventHandlers={{
			click: () => {
				props.setActiveInstance(props.instance.instance_id);
			},
		}}
		color={props.instance.instance_id === props.activeInstance ? "#ffff00" : "#3388ff"}
		opacity={0.5}
		fillOpacity={0}
		stroke={props.instance.instance_id === props.activeInstance}
	>
		{instance.status !== "running" && <SVGOverlay
			attributes={{ stroke: "red" }}
			bounds={getBounds(props.instance.bounds.map(position => [
				-1 * position[1] / scaleFactor,
				position[0] / scaleFactor,
			]))}
		>
			<svg
				viewBox="64 64 896 896"
				focusable="false"
				data-icon="warning"
				y="25%"
				x="25%"
				width="50%"
				height="50%"
				fill={statusColors[instance.status]}
				aria-hidden="true">
				<path d={`M464 720a48 48 0 1096 0 48 48 0 10-96 0zm16-304v184c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V416c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8zm475.7 440l-416-720c-6.2-10.7-16.9-16-27.7-16s-21.6 5.3-27.7 16l-416 720C56 877.4 71.4 904 96 904h832c24.6 0 40-26.6 27.7-48zm-783.5-27.9L512 239.9l339.8 588.2H172.2z${" "}`} />
			</svg>
		</SVGOverlay>}
		<Tooltip direction="center">
			<InstanceTooltip instance_id={props.instance.instance_id} />
		</Tooltip>
	</Rectangle>;
}
