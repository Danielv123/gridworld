local dump_mapview = require("modules/gridworld/map/dump_mapview")
local dump_entities = require("modules/gridworld/map/dump_entities")

local entity_added = require("modules/gridworld/map/entity_added")
local entity_removed = require("modules/gridworld/map/entity_removed")

local on_nth_tick = require("modules/gridworld/map/events/on_nth_tick")

return {
	dump_mapview = dump_mapview,
	dump_entities = dump_entities,
	events = {
		on_nth_tick = on_nth_tick,
		on_built_entity = entity_added,
		on_entity_cloned = entity_added,
		on_entity_destroyed = entity_removed,
		on_robot_built_entity = entity_added,
		script_raised_built = entity_added,
		script_raised_revive = entity_added,
	},
}
