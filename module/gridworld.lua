--[[

Gridworld

When a player enters a map, generate neighboring maps and connections

]]

local clusterio_api = require("modules/clusterio/api")

local function create_world_limit(x_size, y_size, world_x, world_y)
	--[[ Remove everything inside the border wall area ]]
	local world_x = 2
	local world_y = 2
	local x_size = 500
	local y_size = 500
	
	--[[ West of border ]]
	for _,v in pairs(
		game.surfaces[1].find_entities({
			{-10 + (world_x - 1) * x_size, -10 + (world_y - 1) * y_size},
			{(world_x - 1) * x_size, y_size + (world_y - 1) * y_size}
		})
	) do
		v.destroy()
	end
	--[[ East of border ]]
	for _,v in pairs(
		game.surfaces[1].find_entities({
			{x_size + (world_x - 1) * x_size, (world_y - 1) * y_size},
			{x_size + 10 + (world_x - 1) * x_size, y_size + 10 + (world_y - 1) * y_size}
		})
	) do
		v.destroy()
	end
	--[[ South of border ]]
	for _,v in pairs(
		game.surfaces[1].find_entities({
			{-10 + (world_x - 1) * x_size, y_size + (world_y - 1) * y_size},
			{x_size + 10 + (world_x - 1) * x_size, y_size + 10 + (world_y - 1) * y_size}
		})
	) do
		v.destroy()
	end
	--[[ North of border ]]
	for _,v in pairs(
		game.surfaces[1].find_entities({
			{-10 + (world_x - 1) * x_size, -10 + (world_y - 1) * y_size},
			{x_size + 10 + (world_x - 1) * x_size, (world_y - 1) * y_size}
		})
	) do
		v.destroy()
	end
	
	--[[ Create border of walls ]]
	local function create_wall(x,y)
		local entity = game.surfaces[1].create_entity({
			name = "stone-wall",
			position = {x = x + (world_x - 1) * x_size, y = y + (world_y - 1) * y_size}
		})
		if entity ~= nil then
			log(entity.position)
			entity.destructible = false
		end
	end
	for i = -4, x_size + 3 do
		create_wall(i, y_size + 3)
		create_wall(i, -4)
	end
	for i = -3, y_size + 2 do
		create_wall(x_size + 3, i)
		create_wall(-4, i)
	end
end
-- create_world_limit(500,500, 1, 1)

local function create_spawn(x_size, y_size, world_x, world_y)
	game.forces.player.set_spawn_position({x = x_size * (world_x - 1) + x_size / 2, y = y_size * (world_y - 1) + y_size / 2}, game.surfaces[1])
end
-- create_spawn(500, 500, 1, 1)

gridworld = {
	create_world_limit = create_world_limit,
	create_spawn = create_spawn,
}

return gridworld
