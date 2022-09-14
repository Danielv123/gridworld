"use strict";
/**
 * Equivalent to Array.prototype.find, but for Maps.
 * @param {Map} map The map to search.
 * @param {function(value):boolean} predicate The predicate function, looks for truthy values
 * @returns {any} value of first element in map that satisfies predicate
 */
module.exports = function mapFind(map, predicate) {
	for (const [_, value] of map) {
		if (predicate(value)) {
			return value;
		}
	}
	return undefined;
};
