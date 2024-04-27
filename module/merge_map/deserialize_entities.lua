local universal_serializer = require("modules/gridworld/universal_serializer/universal_serializer")

--[[
	Deserialize entities on merge target world
]]
local function deserialize_entities(string)
	local serialized_entities = game.json_to_table(string)
	if type(serialized_entities) ~= "table" then
		error("Expected a table, got " .. type(serialized_entities))
	end

	local entities = {}
	for _, serialized_entity in pairs(serialized_entities) do
		local entity = universal_serializer.LuaEntity.deserialize(serialized_entity)
		table.insert(entities, entity)
	end

	rcon.print("Deserialized " .. #entities .. " entities")
	return entities
end

return deserialize_entities
