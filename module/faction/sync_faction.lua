--[[
	Update faction data on the server

	Force management
	Factorio has an internal limit of 63 forces, which complicates things as our faction system supports more than that.
	To work around this, we instead use 2 factions - one neutral and one for the servers owner faction.
	The neutral faction is used by all players that aren't part of the server owner faction.
]]

local function sync_faction(faction_id, faction_data)
	log("Syncing faction " .. faction_id)
	if global.gridworld.factions == nil then
		global.gridworld.factions = {}
	end
	global.gridworld.factions[faction_id] = game.json_to_table(faction_data)

	-- Add members to the force
	for k,v in pairs(global.gridworld.factions[faction_id].members) do
		local member = game.get_player(v.name)
		if member ~= nil then
			-- Apply faction settings to player

			-- If server is claimed by the players faction, move player to the faction force
			if global.gridworld.claiming_faction.claimed and global.gridworld.claiming_faction.faction_id == faction_id then
				member.force = "faction_claimed"
			end
		end
	end
end

return sync_faction
