import React from "react";

import { PageHeader, PageLayout } from "@clusterio/web_ui";
import "../index.css";
import NewGridworldForm from "../components/CreateGridworldForm";

function CreateGridworldPage() {
	return <PageLayout nav={[{ name: "Gridworld", path: "/gridworld" }, { name: "create" }]}>
		<PageHeader
			title="Create new gridworld"
		/>
		<NewGridworldForm />
	</PageLayout>;
}

export default CreateGridworldPage;
