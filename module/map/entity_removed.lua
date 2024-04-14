local function on_entity_removed(event)
	if global.gridworld.map.removed_entities_to_update == nil then
		global.gridworld.map.removed_entities_to_update = {}
	end
	local entity = global.gridworld.map.entity_registrations[event.registration_number]
	table.insert(global.gridworld.map.removed_entities_to_update, entity)
	global.gridworld.map.entity_registrations[event.registration_number] = nil
end

return on_entity_removed
