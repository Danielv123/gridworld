local get_player_faction = require("modules/gridworld/faction/get_player_faction")

local function get_tab_welcome(player)
	local new_game_button = {
		type = "button",
		caption = "New game",
		style = "button",
		actions = {
			on_click = {
				action = "open_new_game_dialog",
			},
		},
	}

	-- Check if player is part of a faction
	local player_faction = get_player_faction(player)
	if player_faction ~= nil then
		-- Don't allow the player to create a new game if they are part of a faction
		new_game_button = {}
	end

	return {
		tab = {
			type = "tab",
			caption = "Welcome"
		},
		content = {
			type = "flow",
			direction = "vertical",
			style_mods = {
				maximal_height = 450,
				natural_height = 450,
			},
			{
				type = "label",
				caption = "Welcome to the Gridworld lobby server!",
				style = "heading_1_label",
			},
			{
				type = "label",
				caption = "This server is used to host a game of Gridworld. You can join the server by pressing the \"Join server\" button below. You can also create a new game by pressing the \"New game\" button below. Starting a new game will clear your inventory and reset your spawnpoint.",
				style_mods = {
					single_line = false,
				},
			},
			{
				type = "flow",
				style = "horizontal_flow",
				style_mods = {
					horizontal_align = "center",
					vertical_align = "center",
					maximal_width = 999,
					natural_width = 999,
					bottom_padding = 30,
					top_padding = 30,
				},
				{
					type = "button",
					caption = "Join server",
					style = "green_button",
					actions = {
						on_click = {
							action = "join_latest_server",
						},
					},
				},
				new_game_button,
			},
		}
	}
end

return get_tab_welcome
