--[[

Gridworld

When a player enters a map, generate neighboring maps and connections

]]

local clusterio_api = require("modules/clusterio/api")

local function createWorldLimit(x_size, y_size, world_x, world_y)
	x_size = x_size / 2 + 2
	y_size = y_size / 2 + 2

	--[[ Create border of walls ]]
	local function create_wall(x,y)
		local entity = game.player.surface.create_entity({
			name = "stone-wall",
			position = {x = x + world_x * x_size, y = y + world_y * y_size}
		})
		if entity ~= nil then
			entity.destructible = false
		end
	end
	for i = x_size * -1 - 2, x_size + 1 do
		create_wall(i, y_size + 1)
		create_wall(i, y_size * -1 - 2)
	end
	for i = y_size * -1 - 2, y_size + 1 do
		create_wall(x_size + 1, i)
		create_wall(x_size * -1 - 2, i)
	end
end
-- createWorldLimit(500,500, 1, 1)

local gridworld = {
	createWorldLimit = createWorldLimit,
}

return gridworld
