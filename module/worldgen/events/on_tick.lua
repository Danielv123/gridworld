local create_world_limit = require("modules/gridworld/worldgen/create_world_limit")

local function on_tick(event)
	if event.tick == global.gridworld.world_limit_recreate_tick then
		create_world_limit(
			global.gridworld.x_size,
			global.gridworld.y_size,
			global.gridworld.world_x,
			global.gridworld.world_y,
			true
		)
		global.gridworld.world_limit_recreate_tick = nil
	end
end

return on_tick
