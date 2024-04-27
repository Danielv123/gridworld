local LuaEntity_deserialize = require("modules/gridworld/universal_serializer/classes/LuaEntity_deserialize")

local function on_tick()
	if global.delayed_entities_tick ~= nil
		and global.delayed_entities_tick <= game.tick
		and #(global.delayed_entities or {}) > 0
	then
		-- Attempt to deserialize delayed entities
		for i = #global.delayed_entities, 1, -1 do
			local entity = global.delayed_entities[i]
			LuaEntity_deserialize(entity, true)
			table.remove(global.delayed_entities, i)
		end
	end
end

return on_tick
