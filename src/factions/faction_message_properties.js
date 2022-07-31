"use strict";
const factionProperties = {
	faction_id: { type: "string" },
	name: { type: "string" },
	open: { type: "boolean" },
	members: {
		type: "array",
		items: {
			type: "object",
			properties: {
				name: { type: "string" },
				rank: {
					enum: ["leader", "officer", "member", "invited"],
				},
			},
		},
	},
	friends: {
		type: "array", items: { type: "string" },
	},
	enemies: {
		type: "array", items: { type: "string" },
	},
	instances: {
		type: "array",
		items: {
			type: "object",
			properties: {
				instance_id: { type: "integer" },
				last_visited_tick: { type: "integer" },
				last_visited_player: { type: "string" },
			},
		},
	},
	about: {
		type: "object",
		properties: {
			header: { type: "string" },
			description: { type: "string" },
			rules: { type: "string" },
		},
	},
};

module.exports = factionProperties;
