import React from "react";

import { libPlugin } from "@clusterio/lib";

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
	}

	onMasterConnectionEvent(event) {
		if (event === "connect") {

		}
	}
}
