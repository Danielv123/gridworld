/* eslint-disable prefer-arrow-callback */
import {
	createElementObject,
	createTileLayerComponent,
	updateGridLayer,
	withPane,
} from "@react-leaflet/core";
import { TileLayer as TileLayerCustom } from "./TileLayerCustom";

export const TileLayer = createTileLayerComponent(
	function createTileLayer({ url, ...options }, context) {
		const layer = new TileLayerCustom(url, withPane(options, context));
		return createElementObject(layer, context);
	},
	function updateTileLayer(layer, props, prevProps) {
		updateGridLayer(layer, props, prevProps);

		const { url } = props;
		if (url !== null && url !== prevProps.url) {
			layer.setUrl(url, true);
			layer.refresh();
		}
	},
);
