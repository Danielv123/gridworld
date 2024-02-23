"use strict";
const lib = require("@clusterio/lib");

lib.definePermission({
	name: "gridworld.migrate_instance",
	title: "Migrate instance",
	description: "Migrate an instance to another host. Uses stop, start, and assign internally.",
});
