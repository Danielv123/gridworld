local gui = require("modules/gridworld/flib/gui")
local get_faction = require("modules/gridworld/faction/get_faction")

local function get_members_table(faction)
    local members = {
		type = "table",
		name = "gridworld_faction_members_table",
		column_count = 3,
		{
			type = "label",
			caption = "Name",
		},
		{
			type = "label",
			caption = "Role",
		},
		{
			type = "label",
			caption = "Actions",
		},
    }

	for _, member in pairs(faction.members) do
		table.insert(members, {
			type = "label",
			caption = member.name,
		})
		table.insert(members, {
			type = "label",
			caption = member.role,
		})
		local buttons = {
			type = "flow",
			direction = "horizontal",
			{
				type = "button",
				caption = "Kick",
				actions = {
					on_click = {
						location = "faction_admin_screen",
						action = "kick_member",
						player = member.name,
					}
				}
			},
			{
				type = "button",
				caption = "Promote",
				actions = {
					on_click = {
						location = "faction_admin_screen",
						action = "promote_member",
						player = member.name,
					}
				}
			},
			{
				type = "button",
				caption = "Demote",
				actions = {
					on_click = {
						location = "faction_admin_screen",
						action = "demote_member",
						player = member.name,
					}
				}
			},
		}
		table.insert(members, buttons)
    end
	return members
end

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
								faction_id = faction_id,
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
                    -- Members
					{
						tab = { type = "tab", caption = "Members" },
						content = {
							type = "flow",
							direction = "vertical",
							style_mods = {
								maximal_height = 450,
								natural_height = 450,
							},
							{
                                type = "button",
                                caption = "Invite player",
								actions = {
									on_click = {
										location = "faction_admin_screen",
										action = "invite_player",
										faction_id = faction_id,
									}
								}
							},
							get_members_table(faction),
						}
					},
				},
			}
		}
	})
end
-- /c game.player.gui.screen.clear()

return draw_faction_admin_screen
