"use strict";
const { libUsers } = require("@clusterio/lib");

libUsers.definePermission({
	name: "gridworld.migrate_instance",
	title: "Migrate instance",
	description: "Migrate an instance to another slave. Uses stop, start, and assign internally.",
});
