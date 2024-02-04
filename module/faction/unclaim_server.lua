local constants = require("modules/gridworld/constants")
local faction_server_status = require("modules/gridworld/faction/gui/faction_server_status/dialog")

local function unclaim_server(faction_id)
	if faction_id ~= global.gridworld.claiming_faction.faction_id then
		game.print("Error: Attempted to unclaim server using the wrong faction")
	end
	global.gridworld.claiming_faction.claimed = false
	global.gridworld.claiming_faction.faction_id = ""
	global.gridworld.claiming_faction.stored_fp = 0

	-- Trigger custom events
	script.raise_event(constants.custom_events.on_faction_unclaimed_server, {faction_id = faction_id})

	-- Redraw server status and other GUI elements that show the claiming faction
	-- TODO: Only draw for players who have the GUI open
	for _, player in pairs(game.players) do
		faction_server_status.draw(player)
	end
end

return unclaim_server
