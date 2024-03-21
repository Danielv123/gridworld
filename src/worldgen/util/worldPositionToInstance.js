"use strict";
/**
 * Using a world position coordinate (x, y) and grid_id, return the instance grid position
 */

const mapFilter = require("../../util/mapFilter");
const mapFind = require("../../util/mapFind");

function worldPositionToInstance(x, y, grid_id, instances) {
	// Get the grid size
	const grid_instances = mapFilter(instances, instance => instance.config.get("gridworld.grid_id") === grid_id);
	const lobby_server = mapFind(grid_instances, instance => instance.config.get("gridworld.is_lobby_server"));

	const grid_x_size = lobby_server.config.get("gridworld.grid_x_size");
	const grid_y_size = lobby_server.config.get("gridworld.grid_y_size");

	const grid_x_position = Math.floor(x / grid_x_size) + 1;
	const grid_y_position = Math.floor(y / grid_y_size) + 1;

	return {
		x,
		y,
		grid_x_size,
		grid_y_size,
		grid_x_position,
		grid_y_position,
		instance: mapFind(grid_instances, instance => instance.config.get("gridworld.grid_x_position") === grid_x_position
			&& instance.config.get("gridworld.grid_y_position") === grid_y_position
		),
		grid_id,
	};
}

module.exports = worldPositionToInstance;
