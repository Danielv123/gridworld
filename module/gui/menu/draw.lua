local gui = require("modules/gridworld/flib/gui")
local mod_gui = require("mod-gui")

local function draw(player)
	local button_flow = mod_gui.get_button_flow(player)
	if button_flow["gridworld_server_status"] ~= nil then
		button_flow["gridworld_server_status"].destroy()
	end
	if button_flow["gridworld_faction_gui"] ~= nil then
		button_flow["gridworld_faction_gui"].destroy()
	end
	gui.build(button_flow, {
		{
			type = "sprite-button",
			name = "gridworld_server_status",
			sprite = "item/wooden-chest",
			actions = {
				on_click = {
					location = "gridworld_menu",
					action = "gridworld_server_status",
				},
			},
		}, {
			type = "sprite-button",
			name = "gridworld_faction_gui",
			sprite = "item/steel-chest",
			actions = {
				on_click = {
					location = "gridworld_menu",
					action = "gridworld_faction_gui",
				},
			},
		}
	})
end

return draw
