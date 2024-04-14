--[[
	Dump the entire mapview to the nodejs process.
]]

local clusterio_api = require("modules/clusterio/api")

local function dump_mapview(position_a, position_b)
	-- Only process on the server. Modifying any game state after this statement will desync
	if not gridworld.is_server_unsafe_desync then return end

	local tiles = game.surfaces[1].find_tiles_filtered{area = {position_a, position_b}}

	local map_data = {}
	local CHUNK_SIZE = position_b[1] - position_a[1]
	-- Fill map_data with black squares
	for x = 1, CHUNK_SIZE * CHUNK_SIZE do
		map_data[x] = string.format("%02x%02x%02x", 0, 0, 0)
	end
	for _, tile in pairs(tiles) do
		-- Cache the map_color
		local map_color = tile.prototype.map_color
		-- API specifies color can be 0-1 or 0-255. Map color is always 0-255. Alpha is never used.
		local position = tile.position
		local index = (position.x - position_a[1] + 1) + (position.y - position_a[2]) * CHUNK_SIZE
		map_data[index] = string.format("%02x%02x%02x", map_color.r, map_color.g, map_color.b)
	end

	clusterio_api.send_json("gridworld:tile_data", {
		type = "tiles",
		position = position_a,
		size = CHUNK_SIZE,
		data = table.concat(map_data, ";"),
		layer = "tiles_"
	})
end
-- dump_mapview(game.player.position, {x = game.player.position.x + 128, y = game.player.position.y + 128})

return dump_mapview
