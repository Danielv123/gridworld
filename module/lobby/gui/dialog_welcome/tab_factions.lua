local factions_table = require("modules/gridworld/faction/gui/components/factions_table/index")

local function draw_tab_factions()
	local tab = {
		tab = {
			type = "tab",
			caption = "Factions"
		},
		content = {
			type = "scroll-pane",
			direction = "vertical",
			style_mods = {
				height = 450,
			},
			{
				type = "label",
				caption = "Faction list",
				style = "heading_1_label",
			},
			{
				type = "label",
				caption = "These are the current active factions on this cluster",
				style_mods = {
					single_line = false,
				},
			},
			factions_table.draw(),
		}
	}
	return tab
end

return draw_tab_factions
