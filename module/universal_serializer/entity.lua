local clusterio_serialize = require("modules/clusterio/serialize")
-- local clusterio_serialize = serialize

--[[
	Function to serialize an entity to a string.
]]
local function serialize_entity(entity)
	local entity_data = {
		surface = entity.surface.name,
		name = entity.name,
		type = entity.type,
		position = {entity.position.x + 10, entity.position.y},
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
		entity_data.time_to_live = entity.time_to_live --[[ Applies to ghost, combat robot, highlight box, smoke with trigger and sticker ]]
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
game.print(serialize_entity(game.player.selected))

--[[
	Function to deserialize an entity from a string.
]]
local function deserialize_entity(serialized_entity)
	local entity_data = loadstring("return " .. serialized_entity)()
	local properties = {
		name = entity_data.name,
		position = entity_data.position,
		direction = entity_data.direction,
		orientation = entity_data.orientation,
		force = entity_data.force,
		--[[ target ]]
		--[[ source ]]
		player = entity_data.player,
		raise_build = true,
		create_build_effect_smoke = false,
		spawn_decorations = true,
		move_stuck_players = true,
		stack = {count = 1, name = "tank"},
	}
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

	if entity.supports_backer_name() then
		entity.backer_name = entity_data.backer_name
	end
	--[[ train-stop ]]
	if entity_data.type == "train-stop" then
		entity.trains_limit = entity_data.trains_limit
	end

	--[[ Handle inventories ]]
	for i = 1, 10 do
		if entity_data.inventories[i] ~= nil then
			clusterio_serialize.deserialize_inventory(entity.get_inventory(i), entity_data.inventories[i])
		end
	end

	return entity
end
deserialize_entity(serialize_entity(game.player.selected))
