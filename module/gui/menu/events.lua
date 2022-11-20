local draw = require("modules/gridworld/gui/menu/draw")

local dialog_faction_server_status = require("modules/gridworld/faction/gui/faction_server_status/dialog")
local dialog_lobby_welcome = require("modules/gridworld/lobby/gui/dialog_welcome/dialog")

local function on_gui_click(_, action, player)
	if player == nil then return end
	if action.location == "gridworld_menu" then
		if action.action == "gridworld_server_status" then
			dialog_faction_server_status.draw(player)
		end
		if action.action == "gridworld_faction_gui" then
			dialog_lobby_welcome.draw(player)
		end
	end
end

local function on_player_joined_game(_, _, player)
	if player == nil then return end
	draw(player)
end

return {
	on_gui_click = on_gui_click,
	on_player_joined_game = on_player_joined_game,
}
