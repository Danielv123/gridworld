local get_tile_colors = require("modules/gridworld/merge_map/get_tile_colors")

local first = 256
local second = 256^2
local third = 256^3
local function bytesToInt(b1, b2, b3, b4)
	if b1 == nil or b2 == nil or b3 == nil or b4 == nil then
		log("bytesToInt: nil value")
		if b1 ~= nil then log("b1: " .. b1) end
		if b2 ~= nil then log("b2: " .. b2) end
		if b3 ~= nil then log("b3: " .. b3) end
		if b4 ~= nil then log("b4: " .. b4) end
		return 0
	end
	-- return (b1 * third) + (b2 * second) + (b3 * first) + b4 -- Big endian
	return (b4 * third) + (b3 * second) + (b2 * first) + b1 -- Little endian
end

--[[ Receive map tiles from MapMergeRequestHandler and set them in the map. ]]
local function set_map_tile_data(data)
	local surface = game.surfaces["nauvis"]
	-- Tiles are binary encoded as 4 bytes x, 4 bytes y, 1 byte ID

	local tile_colors = get_tile_colors(false)
	-- Create mapping of tile ID to tile name where name is the key in tile_colors
	local tile_id_to_name = {}
	local o = 1
	for k, v in pairs(tile_colors) do
		tile_id_to_name[o] = k
		o = o + 1
	end

	local tiles = {}
	for i = 1, #data, 9 do
		-- Since this is running in Lua 5.2 string.unpack does not exist and we have to use string.byte instead
		local tile = data:byte(i+8)
		if tile ~= 0 and tile ~= nil then
			local x = bytesToInt(data:byte(i, i+3))
			local y = bytesToInt(data:byte(i+4, i+7))
			local name = tile_id_to_name[tile]
			if name == nil then
				log("Tile ID " .. tile .. " not found in tile_colors")
				log(data:sub(i, i+8))
				log("x: " .. x .. " y: " .. y)
				log(#data)
			else
				table.insert(tiles, {position = {x, y}, name = name})
			end
		end
	end

	-- Set the tiles
	surface.set_tiles(tiles)
	rcon.print("Set " .. #tiles .. " tiles")
end

return set_map_tile_data
