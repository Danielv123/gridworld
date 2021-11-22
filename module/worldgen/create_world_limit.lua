local generation_version = require("modules/gridworld/constants").generation_version

local function create_world_limit(x_size, y_size, world_x, world_y, force)
	if not force and global.gridworld.world_limit_version >= generation_version then return end
	global.gridworld.x_size = x_size
	global.gridworld.y_size = y_size
	global.gridworld.world_x = world_x
	global.gridworld.world_y = world_y

	--[[ Remove everything inside the border wall area ]]

	local allowed_names = {"steel-chest", "transport-belt", "fast-transport-belt", "express-transport-belt", "loader", "fast-loader", "express-loader", "character"}
	local allowed_types = {"container", "transport-belt", "loader", "character"}
	--[[ West of border ]]
	for _,v in pairs(
		game.surfaces[1].find_entities_filtered({
			area = {
				{-10 + (world_x - 1) * x_size, -10 + (world_y - 1) * y_size},
				{(world_x - 1) * x_size, y_size + (world_y - 1) * y_size}
			},
			name = allowed_names,
			type = allowed_types,
			invert = true,
		})
	) do
		v.destroy()
	end
	--[[ East of border ]]
	for _,v in pairs(
		game.surfaces[1].find_entities_filtered({
			area = {
				{x_size + (world_x - 1) * x_size, (world_y - 1) * y_size},
				{x_size + 10 + (world_x - 1) * x_size, y_size + 10 + (world_y - 1) * y_size}
			},
			name = allowed_names,
			type = allowed_types,
			invert = true,
		})
	) do
		v.destroy()
	end
	--[[ South of border ]]
	for _,v in pairs(
		game.surfaces[1].find_entities_filtered({
			area = {
				{-10 + (world_x - 1) * x_size, y_size + (world_y - 1) * y_size},
				{x_size + 10 + (world_x - 1) * x_size, y_size + 10 + (world_y - 1) * y_size}
			},
			name = allowed_names,
			type = allowed_types,
			invert = true,
		})
	) do
		v.destroy()
	end
	--[[ North of border ]]
	for _,v in pairs(
		game.surfaces[1].find_entities_filtered({
			area = {
				{-10 + (world_x - 1) * x_size, -10 + (world_y - 1) * y_size},
				{x_size + 10 + (world_x - 1) * x_size, (world_y - 1) * y_size}
			},
			name = allowed_names,
			type = allowed_types,
			invert = true,
		})
	) do
		v.destroy()
	end

	--[[ Create border of "out-of-map"/"stone-wall" ]]
	local function create_wall(x,y)
		game.surfaces[1].set_tiles({{
			name = "out-of-map",
			position = {x = x + (world_x - 1) * x_size, y = y + (world_y - 1) * y_size},
		}}, false)
	end
	for i = -19, x_size + 18 do
		for o = 0, 15 do
			create_wall(i, y_size + 3 + o)
			create_wall(i, -4 + o * -1)
		end
	end
	for i = -3, y_size + 2 do
		for o = 0, 15 do
			create_wall(x_size + 3 + o, i)
			create_wall(-4 + o * -1, i)
		end
	end

	--[[ Set tiles in the border area out of "refined-concrete" ]]
	local function create_concrete(x,y)
		game.surfaces[1].set_tiles({{
			name = "refined-concrete",
			position = {x = x + (world_x - 1) * x_size, y = y + (world_y - 1) * y_size},
		}})
	end
	for i = -2, x_size + 1 do
		create_concrete(i, y_size + 2)
		create_concrete(i, y_size + 1)
		create_concrete(i, y_size + 0)
		create_concrete(i, -3)
		create_concrete(i, -2)
		create_concrete(i, -1)
	end
	for i = -2, y_size + 1 do
		create_concrete(x_size + 2, i)
		create_concrete(x_size + 1, i)
		create_concrete(x_size + 0, i)
		create_concrete(-3, i)
		create_concrete(-2, i)
		create_concrete(-1, i)
	end
end
-- create_world_limit(500,500, 1, 1)

return create_world_limit
