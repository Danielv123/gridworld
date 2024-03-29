--[[
	Update faction data on the server

	Force management
	Factorio has an internal limit of 63 forces, which complicates things as our faction system supports more than that.
	To work around this, we instead use 2 factions - one neutral and one for the servers owner faction.
	The neutral faction is used by all players that aren't part of the server owner faction.
]]

local faction_admin_screen = require("modules/gridworld/faction/gui/faction_admin_screen/dialog")
local faction_server_status = require("modules/gridworld/faction/gui/faction_server_status/dialog")
local set_player_permission_group = require("modules/gridworld/faction/building_restrictions/set_player_permission_group")

local function sync_faction(faction_id, faction_data)
	log("Syncing faction " .. faction_id)
	if global.gridworld.factions == nil then
		global.gridworld.factions = {}
	end
	global.gridworld.factions[faction_id] = game.json_to_table(faction_data)

	-- Add members to the force
	for k,v in pairs(global.gridworld.factions[faction_id].members) do
		local player = game.get_player(v.name)
		if player ~= nil then
			-- Apply faction settings to player

			-- Update faction related GUIs
			faction_admin_screen.update(player)

			-- If server is claimed by the players faction, move player to the faction force
			if global.gridworld.claiming_faction.claimed and global.gridworld.claiming_faction.faction_id == faction_id then
				player.force = "faction_claimed"
			end
		end
	end
	for _, player in pairs(game.players) do
		if player.connected then
			set_player_permission_group(player)
			faction_server_status.update(player)
		end
	end
end

return sync_faction
