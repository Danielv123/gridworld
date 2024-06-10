"use strict";

const mapFind = require("../util/mapFind");
const string_to_direction = require("../util/direction").string_to_direction;

/**
 * Edges have a source and a target.
 * I arrange them so that the source is always on the northern/western edge.
 * This means the southern and eastern side of an instance should have edge targets.
 * @returns {Array} edges[]
 */
module.exports = function getEdges({
	x_size,
	y_size,
	x,
	y,
	instances,
	grid_id,
	includeMissing = false,
	instanceId,
}) {
	const worldfactor_x = (x - 1) * x_size;
	const worldfactor_y = (y - 1) * y_size;
	const edges = [];
	// Edge indexes: 1 = north, 2 = east, 3 = south, 4 = west
	// Northern edge
	edges.push({
		id: `edge_${grid_id}_x${x}_y${y}_to_x${x}_y${y - 1}`,
		updatedAtMs: Date.now(),
		isDeleted: false,
		length: x_size,
		active: false,
		source: {
			instanceId, // Local instance
			origin: [worldfactor_x, worldfactor_y], // Top left corner
			surface: 1,
			direction: string_to_direction("East"), // Points east, entrance is from the rigth side
			ready: false,
		},
		target: {
			instanceId: mapFind(instances, instance => instance.config.get("gridworld.grid_id") === grid_id
				&& instance.config.get("gridworld.grid_x_position") === x
				&& instance.config.get("gridworld.grid_y_position") === y - 1
			)?.config.get("instance.id") || 0,
			origin: [worldfactor_x + x_size, worldfactor_y], // Top right corner of this instance, bottom right corner of target
			surface: 1,
			direction: string_to_direction("West"), // Points west, exit is from the right side
			ready: false,
		},
	});
	// Southern edge
	edges.push({
		id: `edge_${grid_id}_x${x}_y${y + 1}_to_x${x}_y${y}`,
		updatedAtMs: Date.now(),
		isDeleted: false,
		length: x_size,
		active: false,
		source: {
			instanceId: mapFind(instances, instance => instance.config.get("gridworld.grid_id") === grid_id
				&& instance.config.get("gridworld.grid_x_position") === x
				&& instance.config.get("gridworld.grid_y_position") === y + 1
			)?.config.get("instance.id") || 0,
			origin: [worldfactor_x, worldfactor_y + y_size], // Bottom left corner of this instance, top left corner of target
			surface: 1,
			direction: string_to_direction("East"), // Points east, exit is from the right side
			ready: false,
		},
		target: {
			instanceId, // Local instance
			origin: [worldfactor_x + x_size, worldfactor_y + y_size], // Bottom right corner
			surface: 1,
			direction: string_to_direction("West"), // Points west, entrance is from the right side
			ready: false,
		},
	});
	// Eastern edge
	edges.push({
		id: `edge_${grid_id}_x${x + 1}_y${y}_to_x${x}_y${y}`,
		updatedAtMs: Date.now(),
		isDeleted: false,
		length: x_size,
		active: false,
		source: {
			instanceId: mapFind(instances, instance => instance.config.get("gridworld.grid_id") === grid_id
				&& instance.config.get("gridworld.grid_x_position") === x + 1
				&& instance.config.get("gridworld.grid_y_position") === y
			)?.config.get("instance.id") || 0,
			origin: [worldfactor_x, worldfactor_y + y_size], // Bottom left on source, top right on target
			surface: 1,
			direction: string_to_direction("North"), // Points north, exit is from the right side
			ready: false,
		},
		target: {
			instanceId, // Local instance
			origin: [worldfactor_x + x_size, worldfactor_y],
			surface: 1,
			direction: string_to_direction("South"), // Points south, entrance is from the right side
			ready: false,
		},
	});
	// Western edge
	edges.push({
		id: `edge_${grid_id}_x${x}_y${y}_to_x${x - 1}_y${y}`,
		updatedAtMs: Date.now(),
		isDeleted: false,
		length: x_size,
		active: false,
		source: {
			instanceId, // Local instance
			origin: [worldfactor_x, worldfactor_y + y_size], // Bottom left corner
			surface: 1,
			direction: string_to_direction("North"), // Points north, entrance is from the right side
			ready: false,
		},
		target: {
			instanceId: mapFind(instances, instance => instance.config.get("gridworld.grid_id") === grid_id
				&& instance.config.get("gridworld.grid_x_position") === x - 1
				&& instance.config.get("gridworld.grid_y_position") === y
			)?.config.get("instance.id") || 0,
			origin: [worldfactor_x, worldfactor_y], // Top left corner of this instance, top right corner of target
			surface: 1,
			direction: string_to_direction("South"), // Points south, entrane is from the right side
			ready: false,
		},
	});
	if (includeMissing) {
		return edges;
	}
	return edges.filter(edge => edge.source.instanceId !== 0 && edge.target.instanceId !== 0);
};
