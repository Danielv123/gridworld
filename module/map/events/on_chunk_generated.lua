local entity_added = require("modules/gridworld/map/entity_added")
local dump_mapview = require("modules/gridworld/map/dump_mapview")

local function on_chunk_generated(event)
	-- Process entities
	local entities = event.surface.find_entities_filtered({area = event.area})
	for _, entity in pairs(entities) do
		entity_added(nil, entity)
	end

	-- Process tiles
	dump_mapview({event.area.left_top.x, event.area.left_top.y}, {event.area.right_bottom.x, event.area.right_bottom.y})
end

return on_chunk_generated
