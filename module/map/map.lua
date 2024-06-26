local dump_mapview = require("modules/gridworld/map/dump_mapview")
local dump_entities = require("modules/gridworld/map/dump_entities")

local entity_added = require("modules/gridworld/map/entity_added")
local entity_removed = require("modules/gridworld/map/entity_removed")
local entity_removed_unregistered = require("modules/gridworld/map/entity_removed_unregistered")

local on_nth_tick = require("modules/gridworld/map/events/on_nth_tick")
local on_chunk_generated = require("modules/gridworld/map/events/on_chunk_generated")
local on_tile_changed = require("modules/gridworld/map/events/on_tile_changed")

return {
	dump_mapview = dump_mapview,
	dump_entities = dump_entities,
	events = {
		on_nth_tick = on_nth_tick,
		on_built_entity = entity_added,
		on_biter_base_built = entity_added,
		on_entity_cloned = entity_added,
		on_entity_destroyed = entity_removed,
		on_robot_built_entity = entity_added,
		script_raised_built = entity_added,
		script_raised_revive = entity_added,
		on_chunk_generated = on_chunk_generated,
		-- Pre-destruction events, not reliable but used for cleanup of things we havent registered
		on_player_mined_entity = entity_removed_unregistered,
		on_robot_mined_entity = entity_removed_unregistered,
		on_entity_died = entity_removed_unregistered,
		on_pre_robot_exploded_cliff = entity_removed_unregistered,
		-- Tile update events
		on_player_built_tile = on_tile_changed,
		on_player_mined_tile = on_tile_changed,
		on_robot_built_tile = on_tile_changed,
		on_robot_mined_tile = on_tile_changed,
		script_raised_set_tiles = on_tile_changed,
	},
}
