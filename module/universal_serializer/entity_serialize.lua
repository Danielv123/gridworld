local clusterio_serialize = require("modules/clusterio/serialize")

--[[
	Function to serialize an entity to a string.
]]
local function entity_serialize(entity)
	local entity_data = {
		surface = entity.surface.name,
		name = entity.name,
		type = entity.type,
		position = { entity.position.x, entity.position.y },
		direction = entity.direction,
		orientation = entity.orientation,
		force = entity.force.name,
		player = entity.last_user and entity.last_user.name or nil,
	}
	if entity.supports_backer_name() then
		entity_data.backer_name = entity.backer_name
	end
	if entity.type == "entity-ghost" then
		entity_data.ghost_name = entity.ghost_name
		entity_data.time_to_live = entity
			.time_to_live --[[ Applies to ghost, combat robot, highlight box, smoke with trigger and sticker ]]
	end
	if entity.type == "unit" then
		entity_data.unit_number = entity.unit_number
	end
	if entity.type == "assembling-machine" then
		entity_data.recipe = entity.get_recipe() and entity.get_recipe().name
	end
	if entity.type == "container" then
		entity_data.supports_bar = entity.get_inventory(defines.inventory.chest).supports_bar()
		if entity_data.supports_bar then
			entity_data.bar = entity.get_inventory(defines.inventory.chest).get_bar()
		end
	end
	if entity.type == "cliff" then
		entity_data.cliff_orientation = entity.cliff_orientation
	end
	if entity.type == "entity-ghost" then
		entity_data.ghost_name = entity.ghost_name
	end
	if entity.type == "item-entity" and entity.name == "item-on-ground" then
		entity_data.stack = {
			name = entity.stack.name,
			count = entity.stack.count,
		}
	end
	if entity.type == "train-stop" then
		entity_data.trains_limit = entity.trains_limit
	end
	-- Circuit connection
	local control_behavior = entity.get_control_behavior()
	if control_behavior ~= nil then
		entity_data.control_behavior = {}
		if control_behavior.object_name == "LuaTrainStopControlBehavior" then
			entity_data.control_behavior.object_name = control_behavior.object_name
			entity_data.control_behavior.send_to_train = control_behavior.send_to_train
			entity_data.control_behavior.read_from_train = control_behavior.read_from_train
			entity_data.control_behavior.read_stopped_train = control_behavior.read_stopped_train
			entity_data.control_behavior.set_trains_limit = control_behavior.set_trains_limit
			entity_data.control_behavior.read_trains_count = control_behavior.read_trains_count
			entity_data.control_behavior.enable_disable = control_behavior.enable_disable
			entity_data.control_behavior.stopped_train_signal = control_behavior.stopped_train_signal
			entity_data.control_behavior.trains_count_signal = control_behavior.trains_count_signal
			entity_data.control_behavior.trains_limit_signal = control_behavior.trains_limit_signal
		end
		if control_behavior.object_name == "LuaTrainStopControlBehavior" or control_behavior.object_name == "LuaGenericOnOffControlBehavior" then
			entity_data.control_behavior.object_name = control_behavior.object_name
			entity_data.control_behavior.connect_to_logistic_network = control_behavior.connect_to_logistic_network
			if control_behavior.circuit_condition ~= nil then
				entity_data.control_behavior.circuit_condition = { control_behavior.circuit_condition.condition }
			end
			if control_behavior.logistic_condition ~= nil then
				entity_data.control_behavior.logistic_condition = { control_behavior.logistic_condition.condition }
			end
		end
		-- LuaCircuitNetwork (not implemented, needs red and green)
	end

	entity_data.inventories = {}
	--[[ Handle inventories ]]
	--[[ Inventories are indexed from 1 to n, we don't care about their names. ]]
	for i = 1, 10 do
		if entity.get_inventory(i) ~= nil then
			entity_data.inventories[i] = clusterio_serialize.serialize_inventory(entity.get_inventory(i))
		end
	end

	return serpent.line(entity_data)
end

return entity_serialize
