local function on_entity_added(_, entity)
	if global.gridworld.map.added_entities_to_update == nil then
		global.gridworld.map.added_entities_to_update = {}
	end
	table.insert(global.gridworld.map.added_entities_to_update, entity)
end

return on_entity_added
