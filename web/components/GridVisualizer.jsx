import React, { useContext, useEffect, useState } from "react";
import { Form, Input, Button, Select, InputNumber, Checkbox } from 'antd';
import { Map, TileLayer, Marker, Popup, Polygon } from 'react-leaflet'

import { libPlugin } from "@clusterio/lib";
import { PageLayout, ControlContext, useInstance } from "@clusterio/web_ui";
import info from "../../info";

let instancePositionCache = {};

function GridVisualizer(props) {
	let control = useContext(ControlContext);
	// Map objects
	let [objects, setObjects] = useState([]);

	// let instances = props.instances.map(x => {
	// 	let [instance] = useInstance(x.id);
	// 	return instance;
	// })

	// console.log(instances)

	return <div className="grid-visualizer">
		<link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
			integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
			crossOrigin="" />
		<script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"
			integrity="sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA=="
			crossOrigin=""></script>
		<Map
			center={[0, 0]}
			zoom={7}
			scrollWheelZoom={false}
			style={{ width: "100%", height: "500px", backgroundColor: "#141414" }}
		>
			{/* <TileLayer
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/> */}
			<Polygon pathOptions={{ color: '#FF0000' }} positions={[[0, 0], [1, 0], [1, 1], [0, 1]]} />
			{/* <Marker position={[0,0]}>
				<Popup>
					A pretty CSS3 popup. <br /> Easily customizable.
				</Popup>
			</Marker> */}
		</Map>
	</div>
}

export default GridVisualizer;
