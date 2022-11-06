local get_player_faction = require("modules/gridworld/faction/get_player_faction")

local function owner_faction_is_allowed(_entity)
	return true
end

local function guest_faction_is_allowed(_entity)
	return false
end

local function can_build_entity(entity, player)
	-- Get claiming faction
	local claiming_faction_id = global.gridworld.claiming_faction.faction_id
	local faction = get_player_faction(player)
	if claiming_faction_id == faction.faction_id then
		return owner_faction_is_allowed(entity)
	end
	return guest_faction_is_allowed(entity)
end

local function on_built_entity(event)
	-- Don't do anything if the server isn't claimed
	if not global.gridworld.claiming_faction.claimed then
		return
	end

	local entity = event.created_entity
	local player = game.get_player(event.player_index)

	if not can_build_entity(entity, player) then
		-- Return item to player
		local inventory = player.get_main_inventory()
		if inventory ~= nil then
			player.mine_entity(entity, true)
		end
		-- Destroy entity without remnants
		if entity ~= nil and entity.valid and entity.can_be_destroyed() then entity.destroy() end
		player.print("You cannot build this entity on this server.")
	end
end

return on_built_entity
