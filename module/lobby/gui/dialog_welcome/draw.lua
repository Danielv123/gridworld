local gui = require("modules/gridworld/flib/gui")

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
								{
									type = "button",
									caption = "New game",
									style = "button",
									actions = {
										on_click = {
											action = "open_new_game_dialog",
										},
									},
								},
							},
						}
					},
					-- About gridworld
					{
						tab = { type = "tab", caption = "About" },
						content = {
							type = "scroll-pane",
							direction = "vertical",
							style_mods = {
								height = 450,
							},
							{
								type = "label",
								caption = "What is gridworld?",
								style = "heading_1_label",
							},
							{
								type = "label",
								caption = "Gridworld is an infinitely scaleable factorio MMO concept. Using clusterio it divides a single factorio world into multiple limited size servers. Each server simulates a limited part of the game world. When a player moves to the edge of one world they will be prompted to join the next server. This allows us to work around the scaling limitations of the factorio engine.",
								style_mods = {
									single_line = false,
								},
							},
							{
								type = "label",
								caption = "How do I join a server?",
								style = "heading_1_label",
							},
							{
								type = "label",
								caption = "To preserve player positions, it is recommended to join a gridworld cluster via a lobby server (such as this one). This will ensure that you are placed on the same server as your previous character.",
								style_mods = {
									single_line = false,
								},
							},
							{
								type = "label",
								caption = "How do I host my own cluster?",
								style = "heading_1_label",
							},
							{
								type = "label",
								caption = "The source code and instructions for hosting your own cluster can be found on the github repository at https://github.com/Danielv123/gridworld",
								style_mods = {
									single_line = false,
								},
							},
							{
								type = "label",
								caption = "Gridworld is a clusterio plugin, so it requires a working clusterio cluster. You can find the instructions for installing clusterio at https://github.com/clusterio/clusterio",
								style_mods = {
									single_line = false,
								},
							},
						}
					}
				}
			}
		}
	})
end
-- /c game.player.gui.screen.clear()

return draw_welcome
