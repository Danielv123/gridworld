local gui = require("modules/gridworld/flib/gui")
local get_tab_welcome = require("tab_welcome")
local get_tab_about = require("tab_about")
local get_tab_factions = require("tab_factions")

local function draw_welcome(player)
	if player == nil then player = game.player end
	player.gui.center.clear()
	gui.build(player.gui.center, {
		{
			type = "frame",
			direction = "vertical",
			ref = {"window"},
			-- Header
			{
				type = "flow", ref = {"titlebar", "flow"},
				{
					type = "label", style = "frame_title", caption = "Menu", ignored_by_interaction = true,
				},
				{
					type = "empty-widget", style = "draggable_space_header", ignored_by_interaction = true,
				},
			},
			-- Content
			{
				type = "flow",
				{
					type = "tabbed-pane",
					style_mods = {
						maximal_width = 750,
						height = 500,
					},
					elem_mods = {
						selected_tab_index = 1,
					},
					-- Welcome
					get_tab_welcome(),
					-- About gridworld
					get_tab_about(),
					-- Factions list
					get_tab_factions(),
				}
			}
		}
	})
end
-- /c game.player.gui.screen.clear()

return draw_welcome
