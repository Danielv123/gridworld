"use strict";

const mapFind = require("../util/mapFind");
const getEdges = require("../worldgen/getEdges");
const { edge_target_position_offsets } = require("../worldgen/factionGrid/edge_target_position_offsets");

/**
 * Update edge transports edges for a grid square instance
 * @param {object} message Message as defined by UpdateEdgeTransportEdges
 * @param {object} message.data - The message data
 * @param {number} message.data.instance_id - The instance ID of the instance to update edge transports for
 */
module.exports = async function updateEdgeTransportsEdges(message) {
	const instance = this.controller.instances.get(message.data.instance_id);

	if (!instance) {
		this.logger.error(`Instance ${message.data.instance_id} not found`);
		return;
	}
	if (!instance.config.get("gridworld.is_grid_square")) {
		return;
	}

	const x = instance.config.get("gridworld.grid_x_position");
	const y = instance.config.get("gridworld.grid_y_position");
	const grid_id = instance.config.get("gridworld.grid_id");
	// Get x_size and y_size from lobby server
	const lobby_server = mapFind(this.controller.instances, i => i.config.get("gridworld.grid_id") === grid_id
		&& i.config.get("gridworld.is_lobby_server")
	);
	const x_size = lobby_server.config.get("gridworld.grid_x_size");
	const y_size = lobby_server.config.get("gridworld.grid_y_size");

	// Apply edge transports configuration
	const edges = getEdges({
		x_size,
		y_size,
		x,
		y,
		instances: this.controller.instances,
		grid_id,
	});

	// Find neighboring instances and update edge target instance ID
	for (const edge of edges) {
		const target_position = [
			x + edge_target_position_offsets[edge.id][0],
			y + edge_target_position_offsets[edge.id][1],
		];
		const target_instance = this.controller.instances.get(edge.target_instance);
		if (
			target_instance.config.get("gridworld.grid_id") === grid_id
			&& target_instance.config.get("gridworld.grid_x_position") === target_position[0]
			&& target_instance.config.get("gridworld.grid_y_position") === target_position[1]
		) {
			// Update target instance edge configuration
			const edge_transports_config = JSON.parse(JSON.stringify(target_instance.config.get("edge_transports.internal")));
			const target_edge = edge_transports_config.edges.find(e => e.id === edge.target_edge);
			if (target_edge) {
				target_edge.target_instance = message.data.instance_id;
				await this.setInstanceConfigField(edge.target_instance, "edge_transports.internal", edge_transports_config);
				this.logger.info(`Updated edge ${target_edge.id} on existing instance ${edge.target_instance} to target ${message.data.instance_id}`);
			} else {
				// Add new edge
				const target_x_size = target_instance.config.get("gridworld.grid_x_size");
				const target_y_size = target_instance.config.get("gridworld.grid_y_size");
				const target_x = target_instance.config.get("gridworld.grid_x_position");
				const target_y = target_instance.config.get("gridworld.grid_y_position");

				const worldfactor_x = (target_x - 1) * target_x_size;
				const worldfactor_y = (target_y - 1) * target_y_size;

				const origins = [
					[worldfactor_x, worldfactor_y],
					[target_x_size + worldfactor_x, worldfactor_y],
					[target_x_size + worldfactor_x, target_y_size + worldfactor_y],
					[worldfactor_x, target_y_size + worldfactor_y],
				];

				let length = target_x_size;
				if (edge.direction % 2 === 0) {
					length = target_y_size;
				}

				const new_edge = {
					id: edge.target_edge,
					origin: origins[edge.target_edge - 1],
					surface: 1,
					direction: (edge.direction + 4) % 8,
					length,
					target_instance: message.data.instance_id,
					target_edge: edge.id,
				};
				edge_transports_config.edges.push(new_edge);
				await this.setInstanceConfigField(edge.target_instance, "edge_transports.internal", edge_transports_config);
				this.logger.info(`Created new edge on existing instance ${edge.target_instance}`);
			}
		}
	}

	// Set config
	this.logger.info(`Set edges on new instance ${message.data.instance_id}`);
	await this.setInstanceConfigField(message.data.instance_id, "edge_transports.internal", {
		edges: edges,
	});
};
