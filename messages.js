"use strict";
const { plainJson } = require("@clusterio/lib");
const factionProperties = require("./src/factions/faction_message_properties");

const pluginName = "gridworld";

module.exports = {
	CreateFactionGrid: class CreateFactionGrid {
		static type = "request"; // request/event
		static src = ["control", "instance"]; // string or array of strings
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
		static Response = plainJson({
			type: "object",
			properties: {
				ok: { type: "boolean" },
				message: { type: "string" },
			},
		});
	},
	GetMapData: class GetMapData {
		static type = "request";
		static src = ["control", "instance"];
		static dst = "controller";
		static plugin = pluginName;
		static permission = "gridworld.overview.view";
		static jsonSchema = {
			type: "object",
			properties: {
				grid_id: { type: "integer" },
			},
		};
		constructor(grid_id) {
			this.grid_id = grid_id;
		}
		static fromJSON(json) {
			return new this(json.grid_id);
		}
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
		static src = ["instance", "controller"];
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
				gridworlds: { type: "boolean" },
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
	// Event with tile data, generally either a new chunk or placed entities
	TileData: class TileData {
		static type = "request";
		static src = "instance";
		static dst = "controller";
		static plugin = pluginName;
		static jsonSchema = {
			type: "object",
			required: ["type", "data", "instance_id", "grid_id"],
			properties: {
				grid_id: { type: "integer" },
				type: {
					type: "string", enum: [
						"tiles", // array of pixels for a 32x32 chunk with lines starting horizontally from the top
						"pixels", // array of pixels with [x,y,rgb,x,y,rgb] values where rgb are 6 hexadecimal characters
					],
				},
				position: { type: "array", items: { type: "number" } }, // Top left corner of tile area
				size: { type: "number" }, // size of tile area (square)
				data: {
					type: "array",
					items: { type: "string" },
				},
				instance_id: { type: "integer" },
				layer: { type: "string" }, // optional, defaults to "" for entities
			},
		};
		constructor(type, data, position, size, instance_id, grid_id, layer = "") {
			this.type = type;
			this.data = data;
			this.position = position;
			this.size = size;
			this.instance_id = instance_id;
			this.grid_id = grid_id;
			this.layer = layer;
		}
		static fromJSON(json) {
			return new this(json.type, json.data, json.position, json.size, json.instance_id, json.grid_id, json.layer);
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
	StartMapMerge: class StartMapMerge {
		static type = "request";
		static src = "control";
		static dst = "controller";
		static plugin = pluginName;
		static permission = "gridworld.merge.start";
		static jsonSchema = {
			type: "object",
			required: ["host_id", "grid_id"],
			properties: {
				// Target host
				host_id: { type: "integer" },
				// Grid to merge
				grid_id: { type: "integer" },
			},
		};
		static Response = plainJson({
			type: "object",
			properties: {
				ok: { type: "boolean" },
				message: { type: "string" },
				instance_id: { type: "integer" },
			},
		});
		constructor(data) {
			this.host_id = data.host_id;
			this.grid_id = data.grid_id;
		}
		static fromJSON(json) {
			return new this(json);
		}
	},
	GridworldUpdates: class GridworldUpdates {
		static type = "event";
		static src = "controller";
		static dst = "control";
		static plugin = pluginName;
		static permission = "gridworld.overview.view";
		static jsonSchema = {
			type: "object",
			properties: {
				gridworlds: {
					type: "array",
					items: {
						type: "object",
						properties: {
							lobby_server: { type: "integer" }, // Lobby server instance ID
							id: { type: "integer" }, // grid_id
							name_prefix: { type: "string" },
							x_size: { type: "integer" },
							y_size: { type: "integer" },
							use_edge_transports: { type: "boolean" },
						},
					},
				},
			},
		};
		constructor(gridworlds) {
			this.gridworlds = gridworlds;
		}
		static fromJSON(json) {
			return new this(json.gridworlds);
		}
	},
};
