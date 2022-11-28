local on_chunk_generated = require("modules/gridworld/worldgen/events/on_chunk_generated")
local on_tick = require("modules/gridworld/worldgen/events/on_tick")
local create_spawn = require("modules/gridworld/worldgen/create_spawn")
local create_world_limit = require("modules/gridworld/worldgen/create_world_limit")

return {
	create_spawn = create_spawn,
	create_world_limit = create_world_limit,
	events = {
		on_chunk_generated = on_chunk_generated,
		on_tick = on_tick,
	},
}
