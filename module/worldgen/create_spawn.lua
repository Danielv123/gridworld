local generation_version = require("modules/gridworld/constants").generation_version

local function create_spawn(x_size, y_size, world_x, world_y, force)
	if not force and global.gridworld.world_limit.version >= generation_version then return end

	global.gridworld.x_size = x_size
	global.gridworld.y_size = y_size
	global.gridworld.world_x = world_x
	global.gridworld.world_y = world_y
	game.forces.player.set_spawn_position({x = x_size * (world_x - 1) + x_size / 2, y = y_size * (world_y - 1) + y_size / 2}, game.surfaces[1])

	if global.gridworld.chunks_generated == nil then
		global.gridworld.chunks_generated = 20
		local pos = game.forces["player"].get_spawn_position(1)
		game.surfaces[1].request_to_generate_chunks(pos, 20)
	end
end
-- create_spawn(500, 500, 1, 1)

return create_spawn
