"use strict";
/**
 * Equivalent to Array.prototype.filter, but for Maps.
 * @param {Map<any, any>} map Map to filter
 * @param {function(value):boolean} predicate Filtering function
 * @returns {Map<any, any>} Filtered map
 */
module.exports = function mapFilter(map, predicate) {
	const newMap = new Map();
	for (const [key, value] of map) {
		if (predicate(value)) {
			newMap.set(key, value);
		}
	}
	return newMap;
};
