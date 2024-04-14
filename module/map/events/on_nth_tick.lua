local dump_entities = require("modules/gridworld/map/dump_entities")

local function on_nth_tick()
	if global.gridworld.map.added_entities_to_update or #global.gridworld.map.removed_entities_to_update > 0 then
		dump_entities(global.gridworld.map.added_entities_to_update, global.gridworld.map.removed_entities_to_update)
		global.gridworld.map.added_entities_to_update = nil
		global.gridworld.map.removed_entities_to_update = {}
	end
end

return on_nth_tick
