--[[
	GUI handlers for utility functions
]]

local dialog_show_progress = require("gui/show_progress/dialog")

local run_function = function (key, table, event, action, player)
	if table[key] ~= nil then
		table[key](event, action, player)
	end
end

return {
	dialog_show_progress = dialog_show_progress,
	on_gui_click = function (event, action, player)
		run_function("on_gui_click", dialog_show_progress.events, event, action, player)
	end,
}
