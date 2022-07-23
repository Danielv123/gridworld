import React from "react";

import { libPlugin } from "@clusterio/lib";
import { notifyErrorHandler, useItemMetadata, useLocale, PageLayout, ControlContext } from "@clusterio/web_ui";
import info from "../info";

import OverviewPage from "./pages/OverviewPage";
import CreateGridworldPage from "./pages/CreateGridworldPage";

export class WebPlugin extends libPlugin.BaseWebPlugin {
	async init() {
		this.pages = [
			{
				path: "/gridworld",
				sidebarName: "Gridworld",
				permission: "gridworld.overview.view",
				content: <OverviewPage />,
			},
			{
				path: "/gridworld/create",
				permission: "gridworld.create",
				content: <CreateGridworldPage />,
			},
		];
		this.playerPositions = new Map();
		this.callbacks = [];
	}

	onMasterConnectionEvent(event) {
		if (event === "connect") {
			this.updateSubscription();
		}
	}

	async playerPositionEventHandler(message) {
		this.updatePlayerPosition(message.data);
	}

	updatePlayerPosition(player) {
		this.playerPositions.set(player.player_name, player);
		for (let callback of this.callbacks) {
			callback();
		}
	}

	onUpdate(callback) {
		this.callbacks.push(callback);
		if (this.callbacks.length) {
			this.updateSubscription();
		}
	}

	offUpdate(callback) {
		let index = this.callbacks.lastIndexOf(callback);
		if (index === -1) {
			throw new Error("callback is not registered");
		}

		this.callbacks.splice(index, 1);
		if (!this.callbacks.length) {
			this.updateSubscription();
		}
	}

	updateSubscription() {
		if (!this.control.connector.connected) {
			return;
		}

		info.messages.setPlayerPositionSubscription.send(
			this.control, { player_position: Boolean(this.callbacks.length) }
		).catch(notifyErrorHandler("Error subscribing to player positions"));

		if (this.callbacks.length) {
			// Get player positions stored on server (not implemented)
			// info.messages.getStorage.send(this.control).then(
			// result => {
			// this.updatePlayerPosition(result.items);
			// }
			// ).catch(notifyErrorHandler("Error updating player positions"));
		} else {
			this.playerPositions.clear();
		}
	}
}
