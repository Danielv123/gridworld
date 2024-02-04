--[[
	Reduce load_factor when entity is removed
]]
local constants = require("modules/gridworld/constants")

local function on_entity_destroyed(event)
	local registration_number = event.registration_number
	local data = global.gridworld.load_balancing.entity_destroyed_registrations[registration_number]
	if data ~= nil then
		local weight = constants.load_balancing_weights[data.type]
		if weight ~= nil then
			global.gridworld.load_balancing.load_factor = global.gridworld.load_balancing.load_factor - weight
			if global.gridworld.load_balancing.load_factor < 0 then
				global.gridworld.load_balancing.load_factor = 0
			end
		end
	end
end
return on_entity_destroyed
