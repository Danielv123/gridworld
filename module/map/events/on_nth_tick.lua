local dump_entities = require("modules/gridworld/map/dump_entities")

local function on_nth_tick()
	if global.gridworld.map.added_entities_to_update then
		dump_entities(global.gridworld.map.added_entities_to_update)
		global.gridworld.map.added_entities_to_update = nil
	end
end

return on_nth_tick
