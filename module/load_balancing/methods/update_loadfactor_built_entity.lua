--[[
	Update performance index when entities are constructed
]]
local constants = require("modules/gridworld/constants")

local function update_loadfactor_built_entity(entity)
	if constants.load_balancing_weights[entity.type] ~= nil then
		local registration = script.register_on_entity_destroyed(entity)
		global.gridworld.load_balancing.entity_destroyed_registrations[registration] = {
			type = entity.type
		}
		-- Add weight to load_factor
		local weight = constants.load_balancing_weights[entity.type]
		if weight ~= nil then
			global.gridworld.load_balancing.load_factor = global.gridworld.load_balancing.load_factor + weight
		end
	end
end
return update_loadfactor_built_entity
