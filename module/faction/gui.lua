--[[
	GUI handlers for the lobby server.
]]

local run_function = require("modules/gridworld/util/run_function")

local dialog_faction_admin_screen = require("gui/faction_admin_screen/dialog")
local dialog_faction_server_status = require("gui/faction_server_status/dialog")
local factions_table = require("gui/components/factions_table/index")
local faction_edit_screen = require("gui/faction_edit_screen/dialog")
local invite_player_dialog = require("gui/invite_player_dialog/dialog")

return {
	dialog_faction_admin_screen = dialog_faction_admin_screen,
	dialog_faction_server_status = dialog_faction_server_status,
	on_gui_click = function (event, action, player)
		run_function("on_gui_click", dialog_faction_admin_screen.events, event, action, player)
		run_function("on_gui_click", factions_table.events, event, action, player)
		run_function("on_gui_click", faction_edit_screen.events, event, action, player)
		run_function("on_gui_click", dialog_faction_server_status.events, event, action, player)
		run_function("on_gui_click", invite_player_dialog.events, event, action, player)
	end,
	on_gui_checked_state_changed = function (event, action, player)
		run_function("on_gui_checked_state_changed", faction_edit_screen.events, event, action, player)
	end,
	on_gui_text_changed = function (event, action, player)
		run_function("on_gui_text_changed", faction_edit_screen.events, event, action, player)
	end,
}
