local sync_faction = require("faction/sync_faction")
local gui = require("faction/gui")

return {
	sync_faction = sync_faction,
	open_faction_admin_screen = function(player_name, faction_id)
		gui.dialog_faction_admin_screen.draw(game.get_player(player_name), faction_id)
	end,
	gui = gui,
}
