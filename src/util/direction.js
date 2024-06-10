"use strict";
/**
 * If edge direction is 4 (West), that means the belts enter going north to south.
 * The right hand side of the edge is always the entrance/exit
 */
const directions = [
	"East",
	"South-east",
	"South",
	"South-west",
	"West",
	"North-west",
	"North",
	"North-east",
];

function direction_to_string(direction) {
	if (direction === undefined) {
		return "";
	}
	if (typeof direction !== "number" || direction < 0 || direction >= 8) {
		return "unknown";
	}
	return directions[direction % 8];
}

function string_to_direction(string) {
	return directions.indexOf(string);
}

module.exports = {
	direction_to_string,
	string_to_direction,
	directions,
};
