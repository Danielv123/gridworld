local generation_version = require("modules/gridworld/constants").generation_version

local function create_spawn(force)
	if not force and global.gridworld.world_limit_version >= generation_version then return end

	game.forces.player.set_spawn_position({x = 0, y = 0}, game.surfaces[1])
end

return create_spawn
