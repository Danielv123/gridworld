import React from "react";

import { BaseWebPlugin, notifyErrorHandler } from "@clusterio/web_ui";

import OverviewPage from "./pages/OverviewPage";
import CreateGridworldPage from "./pages/CreateGridworldPage";
import FactionsPage from "./pages/FactionsPage";
import FactionViewPage from "./pages/FactionViewPage";
import MergeMapPage from "./pages/MergeMapPage";
import messages from "../messages";

export class WebPlugin extends BaseWebPlugin {
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
			{
				path: "/gridworld/merge_map",
				permission: "gridworld.merge.start",
				content: <MergeMapPage />,
			},
		];
		this.playerPositions = new Map();
		this.factions = new Map();
		this.gridworlds = new Map();
		this.updateHandlers = new Set();
		this.updateHandlerCounts = {
			player_position: 0,
			faction_list: 0,
			gridworlds: 0,
		};

		this.control.handle(messages.PlayerPosition, this.playerPositionEventHandler.bind(this));
		this.control.handle(messages.FactionUpdate, this.factionUpdateEventHandler.bind(this));
		this.control.handle(messages.GridworldUpdates, this.gridworldUpdatesEventHandler.bind(this));
	}

	onControllerConnectionEvent(event) {
		if (event === "connect") {
			this.updateSubscription();
		}
	}

	async playerPositionEventHandler(message) {
		this.updateHandlers.forEach(handler => {
			if (handler.type === "player_position") {
				handler.callback(message);
			}
		});
	}

	async factionUpdateEventHandler(message) {
		this.updateHandlers.forEach(handler => {
			if (handler.type === "faction_list") {
				handler.callback(message.faction);
			}
		});
	}

	async gridworldUpdatesEventHandler(message) {
		this.updateHandlers.forEach(handler => {
			if (handler.type === "gridworlds") {
				handler.callback(message);
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
			gridworlds: this.updateHandlerCounts["gridworlds"] > 0,
		})).catch(notifyErrorHandler("Error subscribing to event updates"));

		if (this.updateHandlerCounts["player_position"] === 0) {
			this.playerPositions.clear();
		}
		if (this.updateHandlerCounts["faction_list"] === 0) {
			this.factions.clear();
		}
		if (this.updateHandlerCounts["gridworlds"] === 0) {
			this.gridworlds.clear();
		}
	}
}
