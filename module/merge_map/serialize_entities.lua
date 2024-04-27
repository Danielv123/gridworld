local universal_serializer = require("modules/gridworld/universal_serializer/universal_serializer")

--[[
	Serialize entities within an area
]]
local function serialize_entities(area, surface)
	if surface == nil then
		surface = game.surfaces["nauvis"]
	end
	local entities = surface.find_entities_filtered({area = area})
	local serialized_entities = {}
	for _, entity in pairs(entities) do
		if entity.valid then
			local serialized_entity = universal_serializer.LuaEntity.serialize(entity)
			table.insert(serialized_entities, serialized_entity)
		end
	end

	rcon.print(game.table_to_json(serialized_entities))
end

return serialize_entities
