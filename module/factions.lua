local sync_faction = require("faction/sync_faction")
local gui = require("faction/gui")
local on_built_entity = require("faction/building_restrictions/on_built_entity")

return {
	sync_faction = sync_faction,
	open_faction_admin_screen = function(player_name, faction_id)
		gui.dialog_faction_admin_screen.draw(game.get_player(player_name), faction_id)
	end,
	gui = gui,
	on_built_entity = on_built_entity,
}
