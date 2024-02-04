local update_loadfactor_built_entity = require("modules/gridworld/load_balancing/methods/update_loadfactor_built_entity")

local function script_raised_built(_, entity)
	update_loadfactor_built_entity(entity)
end
return script_raised_built
