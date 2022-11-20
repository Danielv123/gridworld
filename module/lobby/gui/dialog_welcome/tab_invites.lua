local invites_table = require("modules/gridworld/faction/gui/components/invites_table/index")

local function draw_tab_invites()
	local tab = {
		tab = {
			type = "tab",
			caption = "Invites"
		},
		content = {
			type = "scroll-pane",
			direction = "vertical",
			style_mods = {
				height = 450,
			},
			{
				type = "label",
				caption = "Invite list",
				style = "heading_1_label",
			},
			{
				type = "label",
				caption = "Pending faction invitations:",
				style_mods = {
					single_line = false,
				},
			},
			invites_table.draw(),
		}
	}
	return tab
end

return draw_tab_invites
