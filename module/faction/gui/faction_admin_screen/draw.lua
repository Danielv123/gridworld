local gui = require("modules/gridworld/flib/gui")
local get_faction = require("modules/gridworld/faction/get_faction")

local function draw_faction_admin_screen(player, faction_id)
	if player == nil then player = game.player end
	if player == nil then return false end

	local faction = get_faction(faction_id)

	player.gui.center.clear()
	gui.build(player.gui.center, {
		{
			type = "frame",
			direction = "vertical",
			ref = {"window"},
			-- Header
			{
				type = "flow",
				direction = "horizontal",
				{
					type = "flow",
					direction = "horizontal",
					{
						type = "label",
						style = "frame_title",
						caption = "Faction overview",
						ignored_by_interaction = true,
					},
				},
				{
					type = "flow",
					direction = "horizontal",
					style_mods = {
						horizontal_align = "right",
						horizontally_stretchable = true,
					},
					{
						type = "sprite-button",
						sprite = "utility/rename_icon_small_black",
						style = "tool_button",
						actions = {
							on_click = {
								location = "faction_admin_screen",
								action = "edit_faction",
							}
						},
					},
					{
						type = "sprite-button",
						sprite = "utility/close_white",
						style = "frame_action_button",
						actions = {
							on_click = {
								location = "faction_admin_screen",
								action = "return_to_menu",
							}
						},
					},
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
					-- User customizable front page and statistics
					{
						tab = { type = "tab", caption = "Welcome" },
						content = {
							type = "flow",
							direction = "vertical",
							style_mods = {
								maximal_height = 450,
								natural_height = 450,
							},
							{
								type = "label",
								caption = faction.about.header,
								style = "heading_2_label",
							},
							{
								type = "label",
								caption = faction.about.description,
								style_mods = {
									single_line = false,
								},
							},
							{
								type = "label",
								caption = "Rules",
								style = "heading_2_label",
							},
							{
								type = "label",
								caption = faction.about.rules,
								style_mods = {
									single_line = false,
								},
							},
						}
					},
				},
			}
		}
	})
end
-- /c game.player.gui.screen.clear()

return draw_faction_admin_screen
