local clusterio_serialize = require("modules/clusterio/serialize")
local LuaTrain_deserialize = require("modules/gridworld/universal_serializer/classes/LuaTrain_deserialize")

--[[
	Function to deserialize an entity from a string.
]]
local function entity_deserialize(serialized_entity, is_already_delayed)
	local entity_data = load("return " .. serialized_entity)()

	-- Some entities need to be delayed by a tick to allow the game to initialize stuff
	-- This is a list of entities that need to be delayed
	local delayed_entity_types = {
		["locomotive"] = true,
		["cargo-wagon"] = true,
		["fluid-wagon"] = true,
		["artillery-wagon"] = true,
	}
	if not is_already_delayed and delayed_entity_types[entity_data.type] then
		-- Delay entity creation by a tick
		global.delayed_entities_tick = game.tick + 1 -- Delay by 1 tick
		global.delayed_entities = global.delayed_entities or {}
		table.insert(global.delayed_entities, serialized_entity)
		return nil
	end

	-- Check if player is valid before using it
	local player = nil
	if entity_data.player ~= nil then
		player = game.players[entity_data.player]
	end
	local properties = {
		name = entity_data.name,
		position = entity_data.position,
		direction = entity_data.direction,
		orientation = entity_data.orientation,
		force = entity_data.force,
		--[[ target ]]
		--[[ source ]]
		raise_build = true,
		create_build_effect_smoke = false,
		spawn_decorations = true,
		move_stuck_players = true,
	}
	if player ~= nil then -- Prevent crash if player has never joined this server
		properties.player = player
	end
	--[[ assembling-machine ]]
	if entity_data.type == "assembling-machine" then
		properties.recipe = entity_data.recipe
	end
	--[[ beam is not implemented ]]
	--[[ stream is not implemented ]]
	--[[ container ]]
	if entity_data.type == "container" then
		properties.bar = entity_data.supports_bar and entity_data.bar
	end
	--[[ cliff ]]
	if entity_data.type == "cliff" then
		properties.cliff_orientation = entity_data.cliff_orientation
	end
	--[[ flying-text is not implemented ]]
	--[[ entity-ghost ]]
	if entity_data.type == "entity-ghost" then
		properties.inner_name = entity_data.ghost_name
		properties.expires = entity_data.time_to_live
	end
	--[[ fire is not implemented ]]
	--[[ inserter is not implemented ]]
	--[[ item-entity is not implemented ]]
	--[[ item-request-proxy is not implemented ]]
	--[[ rolling-stock is not implemented ]]
	--[[ locomotive ]]
	if entity_data.type == "locomotive" then
		properties.snap_to_train_stop = false
		-- TODO: use entity.train to serialize the schedule
	end
	--[[ logistic-container is not implemented ]]
	--[[ particle is not implemented ]]
	--[[ artillery-flare is not implemented ]]
	--[[ projectile is not implemented ]]
	--[[ artillery-projectile is not implemented ]]
	--[[ resource is not implemented ]]
	--[[ underground-belt is not implemented ]]
	--[[ programmable-speaker is not implemented ]]
	--[[ character-corpse is not implemented ]]
	--[[ highlight-box is not implemented ]]
	--[[ speech-bubble is not implemented ]]
	--[[ simple-entity-with-owner is not implemented ]]
	--[[ simple-entity-with-force is not implemented ]]
	--[[ item-on-ground ]]
	if entity_data.type == "item-entity" and entity_data.name == "item-on-ground" then
		--[[ create_entity.stack is undocumented but it exists ]]
		--[[ TODO: Use full item stack, including aux information such as spidertron contents and blueprints ]]
		properties.stack = entity_data.stack
	end

	local entity = game.surfaces[entity_data.surface].create_entity(properties)
	if entity == nil then
		log("Failed to create entity " .. entity_data.name .. " at " .. serpent.block(entity_data))
		log("Properties: " .. serpent.block(properties))
		return nil
	end

	if entity.supports_backer_name() then
		entity.backer_name = entity_data.backer_name
	end
	--[[ train-stop ]]
	if entity_data.type == "train-stop" then
		entity.trains_limit = entity_data.trains_limit
	end
	if entity_data.control_behavior ~= nil then
		if entity_data.control_behavior.object_name == "LuaTrainStopControlBehavior" then
			---@class LuaTrainStopControlBehavior
			local control_behavior = entity.get_or_create_control_behavior()
			control_behavior.send_to_train = entity_data.control_behavior.send_to_train
			control_behavior.read_from_train = entity_data.control_behavior.read_from_train
			control_behavior.read_stopped_train = entity_data.control_behavior.read_stopped_train
			control_behavior.set_trains_limit = entity_data.control_behavior.set_trains_limit
			control_behavior.read_trains_count = entity_data.control_behavior.read_trains_count
			control_behavior.enable_disable = entity_data.control_behavior.enable_disable
			control_behavior.stopped_train_signal = entity_data.control_behavior.stopped_train_signal
			control_behavior.trains_count_signal = entity_data.control_behavior.trains_count_signal
			control_behavior.trains_limit_signal = entity_data.control_behavior.trains_limit_signal
			-- Shared with LuaGenericOnOffControlBehavior
			control_behavior.connect_to_logistic_network = entity_data.control_behavior.connect_to_logistic_network
			if entity_data.control_behavior.circuit_condition ~= nil then
				control_behavior.circuit_condition = entity_data.control_behavior.circuit_condition
			end
			if entity_data.control_behavior.logistic_condition ~= nil then
				control_behavior.logistic_condition = entity_data.control_behavior.logistic_condition
			end
		end
		if entity_data.control_behavior.object_name == "LuaGenericOnOffControlBehavior" then
			---@class LuaGenericOnOffControlBehavior
			local control_behavior = entity.get_or_create_control_behavior()
			control_behavior.connect_to_logistic_network = entity_data.control_behavior.connect_to_logistic_network
			if entity_data.control_behavior.circuit_condition ~= nil then
				control_behavior.circuit_condition = entity_data.control_behavior.circuit_condition
			end
			if entity_data.control_behavior.logistic_condition ~= nil then
				control_behavior.logistic_condition = entity_data.control_behavior.logistic_condition
			end
		end
	end

	-- Trains
	if entity_data.train ~= nil then
		LuaTrain_deserialize(entity, entity_data.train)
	end

	--[[ Handle inventories ]]
	for i = 1, 10 do
		if entity_data.inventories[i] ~= nil then
			clusterio_serialize.deserialize_inventory(entity.get_inventory(i), entity_data.inventories[i])
		end
	end

	return entity
end

return entity_deserialize
