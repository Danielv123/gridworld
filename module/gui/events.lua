--[[
	GUI event handlers
]]

local run_function = require("modules/gridworld/util/run_function")

local dialog_menu = require("menu/dialog")

return {
	on_gui_click = function(event, action, player)
		run_function("on_gui_click", dialog_menu.events, event, action, player)
	end,
	on_player_joined_game = function(event, action, player)
		run_function("on_player_joined_game", dialog_menu.events, event, action, player)
	end,
}
