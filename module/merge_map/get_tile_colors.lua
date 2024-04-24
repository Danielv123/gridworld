--[[
	Function that returns a map of tile name to map color
]]
local function get_tile_colors(use_rcon)
	if use_rcon == nil then use_rcon = true end

	local tile_colors = {}
	for k, v in pairs(game.tile_prototypes) do
		if v.map_color then
			tile_colors[v.name] = v.map_color
		end
	end

	--[[ Convert to json ]]
	local tile_colors_json = game.table_to_json(tile_colors)
	if use_rcon then rcon.print(tile_colors_json) end
	return tile_colors
end

return get_tile_colors
