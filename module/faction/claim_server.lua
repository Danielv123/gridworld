local faction_server_status = require("modules/gridworld/faction/gui/faction_server_status/dialog")

local function claim_server(faction_id)
	global.gridworld.claiming_faction.claimed = true
	global.gridworld.claiming_faction.faction_id = faction_id
	global.gridworld.claiming_faction.claim_start = game.tick
	global.gridworld.claiming_faction.claim_cost = 100 -- TODO: Calculate this based on the size of the map
	global.gridworld.claiming_faction.stored_fp = 1000

	-- Redraw server status and other GUI elements that show the claiming faction
	-- TODO: Only draw for players who have the GUI open
	for _, player in pairs(game.players) do
		faction_server_status.draw(player)
	end
end

return claim_server
