local update_loadfactor_built_entity = require("modules/gridworld/load_balancing/methods/update_loadfactor_built_entity")

local function on_built_entity(_, entity)
	update_loadfactor_built_entity(entity)
end
return on_built_entity
