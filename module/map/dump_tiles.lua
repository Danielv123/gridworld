--[[
	Dump changed tiles

	Unlike dump_mapview, this one dumps an array of single tiles. This is less
	space efficient than the chunked format for normal exports, but nmore
	efficient for many small updates such as what happens when robots build concrete.
]]

local clusterio_api = require("modules/clusterio/api")

local function dump_tiles(tiles)
	-- Only process on the server. Modifying any game state after this statement will desync
	if not gridworld.is_server_unsafe_desync then return end

	local map_data = {}
	for _, tilePosition in pairs(tiles) do
		---@diagnostic disable-next-line: missing-parameter
		local tile = game.surfaces[1].get_tile(tilePosition)
		local map_color = tile.prototype.map_color
		table.insert(map_data, tilePosition.x)
		table.insert(map_data, tilePosition.y)
		table.insert(map_data, string.format("%02x%02x%02x%02x", map_color.r, map_color.g, map_color.b, map_color.a))
	end

	clusterio_api.send_json("gridworld:tile_data", {
		type = "pixels",
		data = table.concat(map_data, ";"),
		layer = "tiles_",
	})
end

return dump_tiles
