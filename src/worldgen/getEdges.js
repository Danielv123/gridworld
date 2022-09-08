"use strict";

module.exports = function getEdges({
	x_size,
	y_size,
	x,
	y,
	instances,
}) {
	const worldfactor_x = (x - 1) * x_size;
	const worldfactor_y = (y - 1) * y_size;
	const edges = [];
	// Edge indexes: 1 = north, 2 = east, 3 = south, 4 = west
	// Northern edge
	edges.push({
		id: 1,
		origin: [worldfactor_x, worldfactor_y],
		surface: 1,
		direction: 0, // East
		length: x_size,
		target_instance: instances.find(instance => instance.x === x && instance.y === y - 1)?.instanceId || 0,
		target_edge: 3,
	});
	// Southern edge
	edges.push({
		id: 3,
		origin: [x_size + worldfactor_x, y_size + worldfactor_y],
		surface: 1,
		direction: 4, // West
		length: x_size,
		target_instance: instances.find(instance => instance.x === x && instance.y === y + 1)?.instanceId || 0,
		target_edge: 1,
	});
	// Eastern edge
	edges.push({
		id: 2,
		origin: [x_size + worldfactor_x, worldfactor_y],
		surface: 1,
		direction: 2, // South
		length: y_size,
		target_instance: instances.find(instance => instance.x === x + 1 && instance.y === y)?.instanceId || 0,
		target_edge: 4,
	});
	// Western edge
	edges.push({
		id: 4,
		origin: [worldfactor_x, y_size + worldfactor_y],
		surface: 1,
		direction: 6, // North
		length: y_size,
		target_instance: instances.find(instance => instance.x === x - 1 && instance.y === y)?.instanceId || 0,
		target_edge: 2,
	});
	return edges;
};
