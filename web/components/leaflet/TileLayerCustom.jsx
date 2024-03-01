/* eslint-disable guard-for-in */
import L from "leaflet";

/**
 * Custom TileLayer that allows for in-place replacement of tiles without flickering.
 * The original TileLayer implementation gets flickering from 2 sources:
 * - Delay while downloading tiles
 * - 250ms fade-in animation for tiles
 * The fade in animation is disabled with CSS opacity: 1 !important;
 */

export const TileLayer = L.TileLayer.extend({
	_refreshTileUrl: function (tile, url) {
		// use a image in background, so that only replace the actual tile, once image is loaded in cache!
		let img = new Image();
		img.onload = function () {
			L.Util.requestAnimFrame(() => {
				tile.el.src = url;
			});
		};
		img.src = url;
	},
	refresh: function () {
		for (let key in this._tiles) {
			let tile = this._tiles[key];
			if (tile.current && tile.active) {
				let oldsrc = tile.el.src;
				let newsrc = this.getTileUrl(tile.coords);
				if (oldsrc !== newsrc) {
					this._refreshTileUrl(tile, newsrc);
				}
			}
		}
	},
});
