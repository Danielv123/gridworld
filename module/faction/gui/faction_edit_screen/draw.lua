local gui = require("modules/gridworld/flib/gui")
local get_faction = require("modules/gridworld/faction/get_faction")

local function draw_faction_edit_screen(player, faction_id)
	if player == nil then player = game.player end
	if player == nil then return false end

	local faction = get_faction(faction_id)

	-- Update global state
	global.gridworld.players[player.name].faction_creation = {
		faction_id = faction.faction_id,
		name = faction.name,
		open = faction.open,
		about = {
			header = faction.about.header,
			description = faction.about.description,
			rules = faction.about.rules,
		},
	}

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
						sprite = "utility/confirm_slot",
						style = "tool_button",
						actions = {
							on_click = {
								location = "faction_edit_screen",
								action = "save_faction",
							}
						},
					},
					{
						type = "sprite-button",
						sprite = "utility/close_white",
						style = "frame_action_button",
						actions = {
							on_click = {
								location = "faction_edit_screen",
								action = "return_to_faction_screen",
								faction_id = faction_id,
							}
						},
					},
				},
			},
			-- Content
			{
				type = "tabbed-pane",
				style_mods = {
					maximal_width = 750,
					-- height = 500,
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
						{
							type = "label",
							caption = "Faction name",
							style = "heading_2_label",
						},
						{
							type = "textfield",
							text = faction.name,
							actions = {
								on_text_changed = {
									location = "faction_edit_screen",
									action = "set_faction_name",
								},
							},
						},
						{
							type = "label",
							caption = "Open for players to join",
							style = "heading_2_label",
						},
						{
							type = "checkbox",
							state = faction.open,
							actions = {
								on_checked_state_changed = {
									location = "faction_edit_screen",
									action = "set_faction_open",
								},
							},
						},
						{
							type = "label",
							caption = "Header",
							style = "heading_2_label",
						},
						{
							type = "textfield",
							text = faction.about.header,
							actions = {
								on_text_changed = {
									location = "faction_edit_screen",
									action = "set_faction_about_header",
								},
							},
						},
						{
							type = "label",
							caption = "Description",
							style = "heading_2_label",
						},
						{
							type = "text-box",
							text = faction.about.description,
							style_mods = {
								height = 200,
								width = 400,
							},
							actions = {
								on_text_changed = {
									location = "faction_edit_screen",
									action = "set_faction_about_description",
								},
							},
						},
						{
							type = "label",
							caption = "Rules",
							style = "heading_2_label",
						},
						{
							type = "text-box",
							text = faction.about.rules,
							style_mods = {
								height = 200,
								width = 400,
							},
							actions = {
								on_text_changed = {
									location = "faction_edit_screen",
									action = "set_faction_about_rules",
								},
							},
						},
					}
				},
			},
		}
	})
end
-- /c game.player.gui.screen.clear()

return draw_faction_edit_screen
