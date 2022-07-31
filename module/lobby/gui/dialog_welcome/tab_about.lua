local function get_tab_about()
	return {
		tab = {
			type = "tab",
			caption = "About"
		},
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
end

return get_tab_about
