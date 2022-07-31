local get_force = require("get_force")

--[[
	Update faction data on the server
]]

local function sync_faction(faction_id, faction_data)
	if global.gridworld.factions == nil then
		global.gridworld.factions = {}
	end
	global.gridworld.factions[faction_id] = game.json_to_table(faction_data)

	-- Create force for the faction
	local force = game.create_force(faction_id)

	for k,v in pairs(global.gridworld.factions[faction_id].friends) do
		local friendly_force = get_force(v)
		if friendly_force ~= nil then
			force.set_friend(friendly_force, true)
		end
	end
	for k,v in pairs(global.gridworld.factions[faction_id].enemies) do
		local enemy_force = get_force(v)
		if enemy_force ~= nil then
			force.set_enemy(enemy_force, true)
		end
	end

	-- Add members to the force
	for k,v in pairs(global.gridworld.factions[faction_id].members) do
		local member = game.get_player(v.name)
		if member ~= nil and v.rank ~= "invited" then
			member.force = force
		end
	end
end

return sync_faction
