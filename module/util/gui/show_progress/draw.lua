local gui = require("modules/gridworld/flib/gui")

local function draw_show_progress(player_name, header, text, progress, max_progress)
	local player = game.get_player(player_name)
	if player == nil then player = game.player end
	if player == nil then return false end

	-- Draw edit screen
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
						caption = header,
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
								location = "progress_bar",
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
					type = "progressbar",
					value = progress,
					max_value = max_progress,
					style = "frame_progressbar",
				},
				{
					type = "label",
					caption = text,
				},
			}
		}
	})
end
-- /c game.player.gui.screen.clear()

return draw_show_progress
