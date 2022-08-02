--[[
	GUI handlers for the lobby server.
]]

local dialog_faction_admin_screen = require("gui/faction_admin_screen/dialog")
local factions_table = require("gui/components/factions_table/index")
local faction_edit_screen = require("gui/faction_edit_screen/dialog")

local run_function = function (key, table, event, action, player)
	if table[key] ~= nil then
		table[key](event, action, player)
	end
end

return {
	dialog_faction_admin_screen = dialog_faction_admin_screen,
	on_gui_click = function (event, action, player)
		run_function("on_gui_click", dialog_faction_admin_screen.events, event, action, player)
		run_function("on_gui_click", factions_table.events, event, action, player)
		run_function("on_gui_click", faction_edit_screen.events, event, action, player)
	end,
	on_gui_checked_state_changed = function (event, action, player)
		run_function("on_gui_checked_state_changed", faction_edit_screen.events, event, action, player)
	end,
	on_gui_text_changed = function (event, action, player)
		run_function("on_gui_text_changed", faction_edit_screen.events, event, action, player)
	end,
}
