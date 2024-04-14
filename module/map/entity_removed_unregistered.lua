local ignored_entities = require("modules/gridworld/map/ignored_entities")

local function on_entity_removed(event)
	local entity = event.entity or event.cliff
	if ignored_entities[entity.type] then
		return
	end
	if global.gridworld.map.removed_entities_to_update == nil then
		global.gridworld.map.removed_entities_to_update = {}
	end
	table.insert(global.gridworld.map.removed_entities_to_update, {
		position = entity.position,
		bounding_box = entity.bounding_box,
		deleted = true,
	})
end

return on_entity_removed
