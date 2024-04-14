local ignored_entities = require("modules/gridworld/map/ignored_entities")

local function on_entity_added(_, entity)
	if ignored_entities[entity.type] then
		return
	end
	if global.gridworld.map.added_entities_to_update == nil then
		global.gridworld.map.added_entities_to_update = {}
	end
	table.insert(global.gridworld.map.added_entities_to_update, entity)
	local registration = script.register_on_entity_destroyed(entity)
	global.gridworld.map.entity_registrations[registration] = {
		position = entity.position,
		bounding_box = entity.bounding_box,
		deleted = true,
	}
end

return on_entity_added
