"use strict";
// Grid coordinate offsets, X,Y pair where negative is north/west
// Offset is used to get from the destination back to the origin, using edge id from origin edge as index
const edge_target_position_offsets = [
	{},
	[0, -1], // North, when walking south
	[1, 0], // East, when walking west
	[0, 1], // South, when walking north
	[-1, 0], // West, when walking east
];
exports.edge_target_position_offsets = edge_target_position_offsets;
