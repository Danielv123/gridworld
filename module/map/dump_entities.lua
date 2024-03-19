--[[
	Send entity positions to the nodejs process to add to map
]]

local clusterio_api = require("modules/clusterio/api")

local function dump_entities(entities)
	local map_data = {}
	-- Get entities in the area
	for _, entity in pairs(entities) do
		if entity == nil or entity.valid == false then
			goto continue
		end
		local position = entity.position
		local map_color = entity.prototype.friendly_map_color or entity.prototype.map_color or entity.prototype.enemy_map_color
		if map_color ~= nil then
			local is_resource = entity.prototype.collision_mask["resource-layer"]
			if is_resource then
				if (math.floor(position.x/2) + math.floor(position.y/2)) % 2 == 0 then
				-- Create checkerboard pattern associated with resources
				table.insert(map_data, position.x)
				table.insert(map_data, position.y)
				table.insert(map_data, string.format("%02x%02x%02x", map_color.r, map_color.g, map_color.b))
				end
			else
				-- Format as hexadecimal
				table.insert(map_data, position.x)
				table.insert(map_data, position.y)
				table.insert(map_data, string.format("%02x%02x%02x", map_color.r, map_color.g, map_color.b))
			end
		end
		::continue::
	end

	clusterio_api.send_json("gridworld:tile_data", {
		type = "pixels",
		data = table.concat(map_data, ";"),
	})
end
-- dump_entities(game.surfaces[1].find_tiles_filtered{position = game.player.position, radius = 32})


return dump_entities
