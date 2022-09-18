local random_string = require("modules/gridworld/util/random_string")
local dialog_new_game_draw = require("modules/gridworld/lobby/gui/dialog_new_game/draw")
local clusterio_api = require("modules/clusterio/api")

local function on_gui_click(_, action, player)
	if player == nil then return end
	if action.action == "join_latest_server" then
		game.print("Joining server...")
		clusterio_api.send_json("gridworld:join_gridworld", {
			player_name = player.name,
		})
	end

	if action.action == "open_new_game_dialog" then
		game.print("Opening new game dialog...")
		global.gridworld.players[player.name].faction_creation = {
			faction_id = random_string(8),
			name = player.name.."s faction",
			open = true,
		}
		dialog_new_game_draw(player)
	end
end

return {
	on_gui_click = on_gui_click,
}
