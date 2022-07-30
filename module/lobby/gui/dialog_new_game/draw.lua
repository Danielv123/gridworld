local gui = require("modules/gridworld/flib/gui")

local function draw_new_game_dialog(player)
	if player == nil then player = game.player end
	local faction_creation = global.gridworld.players[player.name].faction_creation

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
						caption = "New faction",
						ignored_by_interaction = true,
					},
					{
						type = "empty-widget",
						style = "draggable_space_header",
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
						sprite = "utility/close_white",
						style = "frame_action_button",
						actions = {
							on_click = {
								location = "new_game_dialog",
								action = "return_to_menu",
							}
						},
					},
				},
			},
			-- Content
			{
				type = "flow",
				direction = "vertical",
				{
					type = "label",
					caption = "Faction preview",
				},
				{
					type = "table",
					column_count = 2,
					draw_vertical_lines = true,
					draw_horizontal_lines = true,
					{
						type = "label",
						caption = "ID",
						style_mods = {
							width = 150,
						},
					},
					{
						type = "flow",
						style_mods = {
							horizontal_align = "center",
							width = 200,
						},
						{
							type = "label",
							caption = faction_creation.faction_id,
							style_mods = {
								horizontal_align = "center",
							},
						},
					},
					{
						type = "label",
						caption = "Faction",
					},
					{
						type = "textfield",
						text = faction_creation.name,
						actions = {
							on_text_changed = {
								location = "new_game_dialog",
								action = "set_faction_name",
							},
						},
						style_mods = {
							horizontal_align = "center",
						},
					},
					{
						type = "label",
						caption = "Open",
					},
					{
						type = "flow",
						style_mods = {
							horizontal_align = "center",
							width = 200,
						},
						{
							type = "checkbox",
							state = faction_creation.open,
							actions = {
								on_checked_state_changed = {
									location = "new_game_dialog",
									action = "open",
								}
							},
							style_mods = {
								horizontal_align = "center",
							},
						},
					},
					{
						type = "label",
						caption = "Color",
					},
					{
						type = "flow",
						style_mods = {
							horizontal_align = "center",
							width = 200,
						},
						{
							type = "label",
							caption = "default",
							style_mods = {
								horizontal_align = "center",
							},
						},
					},
					{
						type = "label",
						caption = "Spawnpoint",
					},
					{
						type = "flow",
						style_mods = {
							horizontal_align = "center",
							width = 200,
						},
						{
							type = "label",
							caption = "World spawn",
						},
					}
				},
				{
					type = "flow",
					style_mods = {
						horizontally_stretchable = true,
						horizontal_align = "center",
					},
					{
						type = "button",
						caption = "Create faction",
						style = "green_button",
						actions = {
							on_click = {
								action = "new_game_dialog_create_faction",
							},
						},
					},
				},
			}
		}
	})
end
-- /c game.player.gui.screen.clear()

return draw_new_game_dialog
