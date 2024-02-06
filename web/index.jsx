import React from "react";

import { libPlugin } from "@clusterio/lib";
import { notifyErrorHandler, useItemMetadata, useLocale, PageLayout, ControlContext } from "@clusterio/web_ui";
import info from "../info";

import OverviewPage from "./pages/OverviewPage";
import CreateGridworldPage from "./pages/CreateGridworldPage";
import FactionsPage from "./pages/FactionsPage";
import FactionViewPage from "./pages/FactionViewPage";
import messages from "../messages";

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
			{
				path: "/gridworld/factions",
				sidebarName: "Factions",
				content: <FactionsPage />,
			},
			{
				path: "/gridworld/factions/:faction_id/view",
				content: <FactionViewPage />,
			},
		];
		this.playerPositions = new Map();
		this.factions = new Map();
		this.updateHandlers = new Set();
		this.updateHandlerCounts = {
			player_position: 0,
			faction_list: 0,
		};
	}

	onControllerConnectionEvent(event) {
		if (event === "connect") {
			this.updateSubscription();
		}
	}

	async playerPositionEventHandler(message) {
		this.updateHandlers.forEach(handler => {
			if (handler.type === "player_position") {
				handler.callback(message.data);
			}
		});
	}

	async factionUpdateEventHandler(message) {
		this.updateHandlers.forEach(handler => {
			if (handler.type === "faction_list") {
				handler.callback(message.data.faction);
			}
		});
	}

	onUpdate(updateHandler) {
		this.updateHandlers.add(updateHandler);
		this.updateHandlerCounts[updateHandler.type] += 1;
		// Subscribe if the first handler of this type was added
		if (this.updateHandlerCounts[updateHandler.type] === 1) {
			this.updateSubscription();
		}
	}

	offUpdate(updateHandler) {
		let is_registered = this.updateHandlers.has(updateHandler);
		if (!is_registered) {
			throw new Error("callback is not registered");
		}

		this.updateHandlers.delete(updateHandler);
		this.updateHandlerCounts[updateHandler.type] -= 1;
		// Unsubscribe if the last handler was removed
		if (this.updateHandlerCounts[updateHandler.type] === 0) {
			this.updateSubscription();
		}
	}

	updateSubscription() {
		if (!this.control.connector.connected) {
			return;
		}
		this.control.send(new messages.SetWebSubscription({
			player_position: this.updateHandlerCounts["player_position"] > 0,
			faction_list: this.updateHandlerCounts["faction_list"] > 0,
		})).catch(notifyErrorHandler("Error subscribing to event updates"));

		if (this.updateHandlerCounts["player_position"] === 0) {
			this.playerPositions.clear();
		}
		if (this.updateHandlerCounts["faction_list"] === 0) {
			this.factions.length = 0;
		}
	}
}
