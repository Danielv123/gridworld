local clusterio_serialize = require("modules/clusterio/serialize")
local LuaTrain_serialize = require("modules/gridworld/universal_serializer/classes/LuaTrain_serialize")
--[[
	Function to serialize an entity to a string.
]]
---@param entity LuaEntity
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
		entity_data.item_requests = entity.item_requests
	end
	if entity.type == "logistic-container" then
		-- entity_data.request_filters = entity.request_filters -- Request_filters is not a property
		-- Read request slots individually
		local slot_count = entity.request_slot_count
		if slot_count > 0 then
			local request_slots = {}
			for i = 1, slot_count do
				local item_stack = entity.get_request_slot(i)
				if item_stack ~= nil then
					request_slots[i] = item_stack
				end
			end
			entity_data.request_slots = request_slots
			entity_data.request_slot_count = slot_count
			-- This line crashes when read on a storage chest (any entity without request slots)
			entity_data.request_from_buffers = entity.request_from_buffers
		end
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
		entity_data.control_behavior.object_name = control_behavior.object_name
		---@param cb LuaGenericOnOffControlBehavior
		local function LuaGenericOnOffControlBehavior_serialize(cb)
			entity_data.control_behavior.connect_to_logistic_network = cb.connect_to_logistic_network
			if cb.circuit_condition ~= nil then
				entity_data.control_behavior.circuit_condition = {
					condition = cb.circuit_condition.condition
				}
			end
			if cb.logistic_condition ~= nil then
				entity_data.control_behavior.logistic_condition = {
					condition = cb.logistic_condition.condition
				}
			end
		end
		if control_behavior.object_name == "LuaTrainStopControlBehavior" then
			entity_data.control_behavior.send_to_train = control_behavior.send_to_train
			entity_data.control_behavior.read_from_train = control_behavior.read_from_train
			entity_data.control_behavior.read_stopped_train = control_behavior.read_stopped_train
			entity_data.control_behavior.set_trains_limit = control_behavior.set_trains_limit
			entity_data.control_behavior.read_trains_count = control_behavior.read_trains_count
			entity_data.control_behavior.enable_disable = control_behavior.enable_disable
			entity_data.control_behavior.stopped_train_signal = control_behavior.stopped_train_signal
			entity_data.control_behavior.trains_count_signal = control_behavior.trains_count_signal
			entity_data.control_behavior.trains_limit_signal = control_behavior.trains_limit_signal
			LuaGenericOnOffControlBehavior_serialize(control_behavior)
		end
		if control_behavior.object_name == "LuaInserterControlBehavior" then
			entity_data.control_behavior.circuit_read_hand_contents = control_behavior.circuit_read_hand_contents
			entity_data.control_behavior.circuit_mode_of_operation = control_behavior.circuit_mode_of_operation
			entity_data.control_behavior.circuit_hand_read_mode = control_behavior.circuit_hand_read_mode
			entity_data.control_behavior.circuit_set_stack_size = control_behavior.circuit_set_stack_size
			entity_data.control_behavior.circuit_stack_control_signal = control_behavior.circuit_stack_control_signal
			LuaGenericOnOffControlBehavior_serialize(control_behavior)
		end
		if control_behavior.object_name == "LuaGenericOnOffControlBehavior" then
			LuaGenericOnOffControlBehavior_serialize(control_behavior)
		end
		-- LuaCircuitNetwork (not implemented, needs red and green)
	end

	-- Trains
	if entity.train ~= nil then
		entity_data.train = LuaTrain_serialize(entity.train)
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
