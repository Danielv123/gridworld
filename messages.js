"use strict";
const { plainJson } = require("@clusterio/lib");
const factionProperties = require("./src/factions/faction_message_properties");

const pluginName = "gridworld";

module.exports = {
	CreateFactionGrid: class CreateFactionGrid {
		static type = "request"; // request/event
		static src = "control"; // string or array of strings
		static dst = "controller";
		static plugin = pluginName;
		static permission = "gridworld.create";
		static jsonSchema = {
			type: "object",
			properties: {
				name_prefix: { type: "string" },
				use_edge_transports: { type: "boolean" },
				x_size: { type: "integer" },
				y_size: { type: "integer" },
				host: { type: "integer" }, // hostID to use for instance creation
			},
		};
		constructor(data) {
			this.data = data;
		}
		static fromJSON(json) {
			return new this(json);
		}
		toJSON() {
			return this.data;
		}
	},
	GetMapData: class GetMapData {
		static type = "request";
		static src = ["control", "instance"];
		static dst = "controller";
		static plugin = pluginName;
		static permission = "gridworld.overview.view";
		static Response = plainJson({
			type: "object",
			properties: {
				map_data: {
					type: "array",
					items: {
						type: "object",
						additionalProperties: false,
						properties: {
							instance_id: { type: "integer" },
							center: { type: "array", items: { type: "number" } },
							bounds: {
								type: "array",
								items: {
									type: "array",
									items: { type: "number" },
								},
							},
							edges: {
								type: "array",
								items: {
									type: "object",
									properties: {
										id: { type: "integer" },
										origin: {
											type: "array",
											items: { type: "integer" },
										},
										surface: { type: "integer" },
										direction: { type: "integer" },
										length: { type: "integer" },
										target_instance: { type: "integer" },
										target_edge: { type: "integer" },
									},
								},
							},
						},
					},
				},
			},
		});
	},
	PopulateNeighborData: class PopulateNeighborData {
		static type = "request";
		static src = "controller";
		static dst = "instance";
		static plugin = pluginName;
		static jsonSchema = {
			type: "object",
			properties: {
				north: { type: ["integer", "null"] },
				south: { type: ["integer", "null"] },
				east: { type: ["integer", "null"] },
				west: { type: ["integer", "null"] },
			},
		};
		constructor(data) {
			this.data = data;
		}
		static fromJSON(json) {
			return new this(json);
		}
		toJSON() {
			return this.data;
		}
	},
	UpdateEdgeTransportEdges: class UpdateEdgeTransportEdges {
		static type = "request";
		static src = "instance";
		static dst = "controller";
		static plugin = pluginName;
		static jsonSchema = {
			type: "object",
			properties: {
				instance_id: { type: "integer" },
			},
		};
		constructor(data) {
			this.data = data;
		}
		static fromJSON(json) {
			return new this(json);
		}
		toJSON() {
			return this.data;
		}
	},
	TeleportPlayer: class TeleportPlayer {
		static type = "request";
		static src = "instance";
		static dst = "instance"; // To broadcast, use .sendTo("allInstances", ...) otherwise use target instance ID
		static plugin = pluginName;
		static jsonSchema = {
			type: "object",
			properties: {
				player_name: { type: "string" },
				x: { type: "number" },
				y: { type: "number" },
			},
		};
		constructor(data) {
			this.data = data;
		}
		static fromJSON(json) {
			return new this(json);
		}
		toJSON() {
			return this.data;
		}
	},
	PlayerPosition: class PlayerPosition {
		static type = "event";
		static src = "instance";
		static dst = ["controller", "control"];
		static plugin = pluginName;
		static jsonSchema = {
			type: "object",
			properties: {
				player_name: { type: "string" },
				instance_id: { type: "integer" },
				x: { type: "number" },
				y: { type: "number" },
			},
		};
		constructor(json) {
			this.player_name = json.player_name;
			this.instance_id = json.instance_id;
			this.x = json.x;
			this.y = json.y;
		}
		static fromJSON(json) {
			return new this(json);
		}
	},
	SetWebSubscription: class SetWebSubscription {
		static type = "request";
		static src = "control";
		static dst = "controller";
		static plugin = pluginName;
		static permission = "gridworld.overview.view";
		static jsonSchema = {
			type: "object",
			properties: {
				player_position: { type: "boolean" },
				faction_list: { type: "boolean" },
			},
		};
		constructor(data) {
			this.data = data;
		}
		static fromJSON(json) {
			return new this(json);
		}
		toJSON() {
			return this.data;
		}
	},
	CreateFaction: class CreateFaction {
		static type = "request";
		static src = "instance";
		static dst = "controller";
		static plugin = pluginName;
		static jsonSchema = {
			type: "object",
			properties: factionProperties,
		};
		constructor(data) {
			this.data = data;
		}
		static fromJSON(json) {
			return new this(json);
		}
		toJSON() {
			return this.data;
		}
		static Response = plainJson({
			type: "object",
			properties: {
				ok: { type: "boolean" },
				faction: {
					type: "object",
					properties: factionProperties,
				},
			},
		});
	},
	// Send updated faction data to controller for propagation. Used to edit factions
	UpdateFaction: class UpdateFaction {
		static type = "request";
		static src = "instance";
		static dst = "controller";
		static plugin = pluginName;
		static jsonSchema = {
			type: "object",
			properties: {
				faction_id: { type: "string" },
				name: { type: "string" },
				open: { type: "boolean" },
				about: {
					type: "object",
					properties: {
						header: { type: "string" },
						description: { type: "string" },
						rules: { type: "string" },
					},
				},
			},
		};
		constructor(data) {
			this.data = data;
		}
		static fromJSON(json) {
			return new this(json);
		}
		toJSON() {
			return this.data;
		}
		static Response = plainJson({
			type: "object",
			required: ["ok", "message"],
			properties: {
				ok: { type: "boolean" },
				message: { type: "string" },
				faction: {
					type: "object",
					properties: factionProperties,
				},
			},
		});
	},
	// Event notifying an instance of changes to a faction
	FactionUpdate: class FactionUpdate {
		static type = "event";
		static src = "controller";
		static dst = ["instance", "control"];
		static plugin = pluginName;
		static jsonSchema = {
			type: "object",
			properties: {
				faction: {
					type: "object",
					properties: factionProperties,
				},
			},
		};
		constructor(data) {
			this.data = data;
		}
		static fromJSON(json) {
			return new this(json);
		}
		toJSON() {
			return this.data;
		}
	},
	// Get changed factions
	RefreshFactionData: class RefreshFactionData {
		static type = "request";
		static src = "instance";
		static dst = "controller";
		static plugin = pluginName;
		static Response = plainJson({
			type: "object",
			properties: {
				ok: { type: "boolean" },
				message: { type: "string" },
				factions: {
					type: "array",
					items: {
						type: "object",
						properties: factionProperties,
					},
				},
			},
		});
	},
	FactionInvitePlayer: class FactionInvitePlayer {
		static type = "request";
		static src = "instance";
		static dst = "controller";
		static plugin = pluginName;
		static jsonSchema = {
			type: "object",
			properties: {
				faction_id: { type: "string" },
				player_name: { type: "string" },
				role: { type: "string" },
			},
		};
		constructor(data) {
			this.data = data;
		}
		static fromJSON(json) {
			return new this(json);
		}
		toJSON() {
			return this.data;
		}
		static Response = plainJson({
			type: "object",
			properties: {
				ok: { type: "boolean" },
				message: { type: "string" },
			},
		});
	},
	JoinFaction: class JoinFaction {
		static type = "request";
		static src = "instance";
		static dst = "controller";
		static plugin = pluginName;
		static jsonSchema = {
			type: "object",
			properties: {
				faction_id: { type: "string" },
				player_name: { type: "string" },
			},
		};
		constructor(data) {
			this.data = data;
		}
		static fromJSON(json) {
			return new this(json);
		}
		toJSON() {
			return this.data;
		}
		static Response = plainJson({
			type: "object",
			properties: {
				ok: { type: "boolean" },
				message: { type: "string" },
			},
		});
	},
	LeaveFaction: class LeaveFaction {
		static type = "request";
		static src = "instance";
		static dst = "controller";
		static plugin = pluginName;
		static jsonSchema = {
			type: "object",
			properties: {
				faction_id: { type: "string" },
				player_name: { type: "string" },
			},
		};
		constructor(data) {
			this.data = data;
		}
		static fromJSON(json) {
			return new this(json);
		}
		toJSON() {
			return this.data;
		}
		static Response = plainJson({
			type: "object",
			properties: {
				ok: { type: "boolean" },
				message: { type: "string" },
			},
		});
	},
	FactionChangeMemberRole: class FactionChangeMemberRole {
		static type = "request";
		static src = "instance";
		static dst = "controller";
		static plugin = pluginName;
		static jsonSchema = {
			type: "object",
			properties: {
				faction_id: { type: "string" },
				player_name: { type: "string" },
				role: factionProperties.members.items.properties.role,
			},
		};
		constructor(data) {
			this.data = data;
		}
		static fromJSON(json) {
			return new this(json);
		}
		toJSON() {
			return this.data;
		}
		static Response = plainJson({
			type: "object",
			properties: {
				ok: { type: "boolean" },
				message: { type: "string" },
			},
		});
	},
	ClaimServer: class ClaimServer {
		static type = "request";
		static src = "instance";
		static dst = "controller";
		static plugin = pluginName;
		static jsonSchema = {
			type: "object",
			properties: {
				instance_id: { type: "integer" },
				player_name: { type: "string" },
				faction_id: { type: "string" },
			},
		};
		constructor(data) {
			this.data = data;
		}
		static fromJSON(json) {
			return new this(json);
		}
		toJSON() {
			return this.data;
		}
		static Response = plainJson({
			type: "object",
			properties: {
				ok: { type: "boolean" },
				message: { type: "string" },
			},
		});
	},
	UnclaimServer: class UnclaimServer {
		static type = "request";
		static src = "instance";
		static dst = "controller";
		static plugin = pluginName;
		static jsonSchema = {
			type: "object",
			properties: {
				instance_id: { type: "integer" },
				player_name: { type: "string" },
			},
		};
		constructor(data) {
			this.data = data;
		}
		static fromJSON(json) {
			return new this(json);
		}
		toJSON() {
			return this.data;
		}
		static Response = plainJson({
			type: "object",
			properties: {
				ok: { type: "boolean" },
				message: { type: "string" },
			},
		});
	},
	JoinGridworld: class JoinGridworld {
		static type = "request";
		static src = "instance";
		static dst = "controller";
		static plugin = pluginName;
		static jsonSchema = {
			type: "object",
			properties: {
				player_name: { type: "string" },
				grid_id: { type: "integer" },
			},
		};
		constructor(data) {
			this.data = data;
		}
		static fromJSON(json) {
			return new this(json);
		}
		toJSON() {
			return this.data;
		}
		static Response = plainJson({
			type: "object",
			properties: {
				ok: { type: "boolean" },
				message: { type: "string" },
				connection_address: { type: "string" },
				server_name: { type: "string" },
				server_description: { type: "string" },
			},
		});
	},
	PerformEdgeTeleport: class PerformEdgeTeleport {
		static type = "request";
		static src = "instance";
		static dst = "controller";
		static plugin = pluginName;
		static jsonSchema = {
			type: "object",
			properties: {
				player_name: { type: "string" },
				player_x_position: { type: "number" },
				player_y_position: { type: "number" },
				grid_id: { type: "integer" },
			},
		};
		constructor(data) {
			this.data = data;
		}
		static fromJSON(json) {
			return new this(json);
		}
		toJSON() {
			return this.data;
		}
		static Response = plainJson({
			type: "object",
			properties: {
				ok: { type: "boolean" },
				message: { type: "string" },
				connection_address: { type: "string" },
				server_name: { type: "string" },
				server_description: { type: "string" },
				instance_id: { type: "integer" },
			},
		});
	},
	GetTileData: class GetTileData {
		static type = "request";
		static src = "controller";
		static dst = "instance";
		static plugin = pluginName;
		static jsonSchema = {
			type: "object",
			properties: {
				instance_id: { type: "integer" },
				position_a: { type: "array", items: { type: "number" } },
				position_b: { type: "array", items: { type: "number" } },
			},
		};
		constructor(data) {
			this.data = data;
		}
		static fromJSON(json) {
			return new this(json);
		}
		toJSON() {
			return this.data;
		}
	},
	RefreshTileData: class RefreshTileData {
		static type = "request";
		static src = "control";
		static dst = "controller";
		static plugin = pluginName;
		static permission = "gridworld.map.refresh";
		static jsonSchema = {
			type: "object",
			properties: {
				instance_id: { type: "integer" },
			},
		};
		constructor(data) {
			this.data = data;
		}
		static fromJSON(json) {
			return new this(json);
		}
		toJSON() {
			return this.data;
		}
	},
	SetLoadFactor: class SetLoadFactor {
		static type = "event";
		static src = "instance";
		static dst = "controller";
		static plugin = pluginName;
		static jsonSchema = {
			type: "object",
			properties: {
				instance_id: { type: "integer" },
				load_factor: { type: "number" },
			},
		};
		constructor(data) {
			this.data = data;
		}
		static fromJSON(json) {
			return new this(json);
		}
		toJSON() {
			return this.data;
		}
	},
};
