local update_loadfactor_built_entity = require("modules/gridworld/load_balancing/methods/update_loadfactor_built_entity")

local function on_entity_cloned(_, entity)
	update_loadfactor_built_entity(entity)
end
return on_entity_cloned
