local gui = require("modules/gridworld/flib/gui")

local function draw_invite_player_dialog(player)
	gui.build(player.gui.center, {
		{
			type = "frame",
			name = "gridworld_invite_player_dialog",
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
						caption = "Invite player to faction",
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
								location = "invite_player_dialog",
								action = "close_dialog",
							}
						},
					},
				},
			},
			-- Content
			{
				type = "flow",
				name = "content",
				{
					type = "table",
					name = "gridworld_invite_player_table",
					column_count = 2,
					{
						type = "label",
						caption = "Player name",
					},
					{
						type = "textfield",
						name = "gridworld_invite_player_textfield",
					},
					{
						type = "label",
						caption = "Role",
					},
					{
						type = "drop-down",
						name = "gridworld_invite_player_role",
						items = { "Leader", "Officer", "Member" },
						selected_index = 3,
						actions = {
							on_selection_state_changed = {
								location = "invite_player_dialog",
								action = "update_role",
							}
						},
					},
					{
						type = "label",
						caption = "",
					},
					{
						type = "button",
						name = "gridworld_invite_player_button",
						caption = "Invite",
						actions = {
							on_click = {
								location = "invite_player_dialog",
								action = "invite_button",
							}
						},
					},
				},
			},
		},
	})
end

return draw_invite_player_dialog
