"use strict";
module.exports = function getEdges({
	message,
	worldfactor_x,
	worldfactor_y,
	x_size,
	y_size,
	x,
	y,
	instances,
}) {
	let edges = [];
	// Edge indexes: 1 = north, 2 = east, 3 = south, 4 = west
	// Northern edge
	if (y > 1) {
		edges.push({
			id: 1,
			origin: [worldfactor_x, worldfactor_y],
			surface: 1,
			direction: 0, // East
			length: x_size,
			target_instance: instances.find(instance => instance.x === x && instance.y === y - 1).instanceId,
			target_edge: 3,
		});
	}
	// Southern edge
	if (y < message.data.y_count) {
		edges.push({
			id: 3,
			origin: [x_size + worldfactor_x, y_size + worldfactor_y],
			surface: 1,
			direction: 4, // West
			length: x_size,
			target_instance: instances.find(instance => instance.x === x && instance.y === y + 1).instanceId,
			target_edge: 1,
		});
	}
	// Eastern edge
	if (x < message.data.x_count) {
		edges.push({
			id: 2,
			origin: [x_size + worldfactor_x, worldfactor_y],
			surface: 1,
			direction: 2, // South
			length: y_size,
			target_instance: instances.find(instance => instance.x === x + 1 && instance.y === y).instanceId,
			target_edge: 4,
		});
	}
	// Western edge
	if (x > 1) {
		edges.push({
			id: 4,
			origin: [worldfactor_x, y_size + worldfactor_y],
			surface: 1,
			direction: 6, // North
			length: y_size,
			target_instance: instances.find(instance => instance.x === x - 1 && instance.y === y).instanceId,
			target_edge: 2,
		});
	}
	return edges;
};
