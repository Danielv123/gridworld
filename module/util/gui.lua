--[[
	GUI handlers for utility functions
]]

local run_function = require("modules/gridworld/util/run_function")

local dialog_show_progress = require("gui/show_progress/dialog")

return {
	dialog_show_progress = dialog_show_progress,
	on_gui_click = function (event, action, player)
		run_function("on_gui_click", dialog_show_progress.events, event, action, player)
	end,
}
