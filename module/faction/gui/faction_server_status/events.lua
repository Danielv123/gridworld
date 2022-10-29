local clusterio_api = require("modules/clusterio/api")
local util_gui = require("modules/gridworld/util/gui")
local get_player_faction = require("modules/gridworld/faction/get_player_faction")

local function on_gui_click(_, action, player)
	if player == nil then return end
	if action.location == "faction_server_status" then
		if action.action == "close" then
			player.gui.left.clear()
		end
		if action.action == "join_lobby_server" then
			player.connect_to_server({address = "localhost:10000", name = "Lobby server"}) -- TODO: Use correct lobby address here
		end
		if action.action == "claim_server" then
			-- Open claim dialog
			local faction = get_player_faction(player)
			util_gui.dialog_show_progress.draw(player.name, "Claiming server", "Sending changes to cluster", 1, 3)
			clusterio_api.send_json("gridworld:claim_server", {
				faction_id = faction.faction_id,
				player_name = player.name,
			})
		end
		if action.action == "unclaim_server" then
			-- Open unclaim dialog
			local faction = get_player_faction(player)
			util_gui.dialog_show_progress.draw(player.name, "Unclaiming server", "Sending changes to cluster", 1, 3)
			clusterio_api.send_json("gridworld:unclaim_server", {
				faction_id = faction.faction_id,
				player_name = player.name,
			})
		end
	end
end

return {
	on_gui_click = on_gui_click,
}
