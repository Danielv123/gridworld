"use strict";
module.exports = async function getMapDataRequestHandler({ grid_id }) {
	if (grid_id === undefined) {
		throw new Error("grid_id is required");
	}
	const instances = [...this.controller.instances]
		.filter(instance => instance[1].config.get("gridworld.grid_id") === grid_id)
		.filter(instance => instance[1].config.get("gridworld.is_grid_square") === true);
	return {
		map_data: instances.map(instance => ({
			instance_id: instance[1].config.get("instance.id"),
			center: [
				(instance[1].config.get("gridworld.grid_x_position") - 1) *
				instance[1].config.get("gridworld.grid_x_size") +
				instance[1].config.get("gridworld.grid_x_size") / 2,
				(instance[1].config.get("gridworld.grid_y_position") - 1) *
				instance[1].config.get("gridworld.grid_y_size") +
				instance[1].config.get("gridworld.grid_y_size") / 2,
			],
			bounds: [
				[ // Top left
					(instance[1].config.get("gridworld.grid_x_position") - 1) *
					instance[1].config.get("gridworld.grid_x_size"),
					(instance[1].config.get("gridworld.grid_y_position") - 1) *
					instance[1].config.get("gridworld.grid_y_size"),
				], [ // Bottom left
					(instance[1].config.get("gridworld.grid_x_position") - 1) *
					instance[1].config.get("gridworld.grid_x_size"),
					instance[1].config.get("gridworld.grid_y_position") *
					instance[1].config.get("gridworld.grid_y_size"),
				], [ // Bottom right
					instance[1].config.get("gridworld.grid_x_position") *
					instance[1].config.get("gridworld.grid_x_size"),
					instance[1].config.get("gridworld.grid_y_position") *
					instance[1].config.get("gridworld.grid_y_size"),
				], [ // Top right
					instance[1].config.get("gridworld.grid_x_position") *
					instance[1].config.get("gridworld.grid_x_size"),
					(instance[1].config.get("gridworld.grid_y_position") - 1) *
					instance[1].config.get("gridworld.grid_y_size"),
				],
			],
		})),
	};
};
