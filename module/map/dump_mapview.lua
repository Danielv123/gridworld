--[[
    Dump the entire mapview to the nodejs process.
]]

local function dump_mapview(position_a, position_b)
    local tiles = game.surfaces[1].find_tiles_filtered{area = {position_a, position_b}}

    local map_data = {}
    local length = 1
    for _, tile in pairs(tiles) do
        -- tile_data.p = tile.position
        -- Cache the map_color
        local map_color = tile.prototype.map_color
        -- API specifies color can be 0-1 or 0-255. Map color is always 0-255. Alpha is never used.
        map_data[length] = string.format("%02x%02x%02x", map_color.r, map_color.g, map_color.b)
        length = length + 1
    end
    rcon.print(table.concat(map_data, ";"))
end
-- dump_mapview(game.player.position, {x = game.player.position.x + 128, y = game.player.position.y + 128})

return dump_mapview
