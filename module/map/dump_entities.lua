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
				-- Create checkerboard pattern associated with resources
				if (math.floor(position.x/2) + math.floor(position.y/2)) % 2 == 0 then
					table.insert(map_data, position.x)
					table.insert(map_data, position.y)
					table.insert(map_data, string.format("%02x%02x%02x", map_color.r, map_color.g, map_color.b))
				end
			else
				-- Determine size of entity to draw
				-- TODO: Does not seem to get the correct shape for trees and cliffs
				local size_x = math.ceil((entity.bounding_box.left_top.x - entity.bounding_box.right_bottom.x) * -1)
				local size_y = math.ceil((entity.bounding_box.left_top.y - entity.bounding_box.right_bottom.y) * -1)

				-- Add pixels
				for x = 0, size_x-1 do
					for y = 0, size_y-1 do
						-- Format as hexadecimal
						table.insert(map_data, position.x + x - (size_x-1)/2)
						table.insert(map_data, position.y + y - (size_y-1)/2)
						if entity.type == "entity-ghost" then
							-- Render as purple
							table.insert(map_data, "A800A8")
						else
						table.insert(map_data, string.format("%02x%02x%02x", map_color.r, map_color.g, map_color.b))
						end
					end
				end
			end
		end
		::continue::
	end

	clusterio_api.send_json("gridworld:tile_data", {
		type = "pixels",
		data = table.concat(map_data, ";"),
	})
end
-- /c gridworld.map.dump_entities({game.player.selected})
-- gridworld.map.dump_entities(game.surfaces[1].find_tiles_filtered{position = game.player.position, radius = 32})

return dump_entities
