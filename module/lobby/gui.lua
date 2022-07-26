--[[
	GUI handlers for the lobby server.
]]

local draw_welcome = require("modules/gridworld/lobby/gui/draw_welcome")
local on_gui_click = require("modules/gridworld/lobby/gui/events/on_gui_click")

return {
	draw_welcome = draw_welcome,
	on_gui_click = on_gui_click,
}
