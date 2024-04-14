local function on_tile_changed(event)
	local tiles = event.tiles
	if global.gridworld.map.tiles_to_update == nil then
		global.gridworld.map.tiles_to_update = {}
	end
	for _, tile in pairs(tiles) do
		table.insert(global.gridworld.map.tiles_to_update, tile.position)
	end
end

return on_tile_changed
