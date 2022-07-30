--[[
	GUI handlers for the lobby server.
]]

local dialog_welcome = require("gui/dialog_welcome/dialog")
local dialog_new_game = require("gui/dialog_new_game/dialog")

local run_function = function (key, table, event, action, player)
	if table[key] ~= nil then
		table[key](event, action, player)
	end
end

return {
	dialog_welcome = dialog_welcome,
	dialog_new_game = dialog_new_game,
	on_gui_click = function (event, action, player)
		run_function("on_gui_click", dialog_welcome.events, event, action, player)
		run_function("on_gui_click", dialog_new_game.events, event, action, player)
	end,
	on_gui_checked_state_changed = function (event, action, player)
		run_function("on_gui_checked_state_changed", dialog_welcome.events, event, action, player)
		run_function("on_gui_checked_state_changed", dialog_new_game.events, event, action, player)
	end,
	on_gui_text_changed = function (event, action, player)
		run_function("on_gui_text_changed", dialog_welcome.events, event, action, player)
		run_function("on_gui_text_changed", dialog_new_game.events, event, action, player)
	end
}
