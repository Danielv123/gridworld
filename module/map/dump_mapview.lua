--[[
    Dump the entire mapview to the nodejs process.
]]

local function dump_mapview(position_a, position_b)
    local tiles = game.surfaces[1].find_tiles_filtered{area = {position_a, position_b}}

    local map_data = {}
    for _, tile in pairs(tiles) do
        local tile_data = {}
        -- tile_data.p = tile.position
        tile_data.c = tile.prototype.map_color
        map_data[#map_data + 1] = tile_data
    end
    rcon.print(game.table_to_json(map_data))
    -- game.write_file("map_data.json", game.table_to_json(map_data))
end
-- dump_mapview(game.player.position, {x = game.player.position.x + 128, y = game.player.position.y + 128})

return dump_mapview
