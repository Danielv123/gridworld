local gui = require("modules/gridworld/flib/gui")
local get_faction = require("modules/gridworld/faction/get_faction")

local function get_members_table(faction, player)
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
    local player_role = "member"
	for _, member in pairs(faction.members) do
		if member.name:lower() == player.name:lower() then
			player_role = member.role
        end
	end

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
		}
		if player_role == "leader" or (player_role == "officer" and member.role == "member") then
			table.insert(buttons, {
				type = "button",
				caption = "Kick",
				actions = {
					on_click = {
						location = "faction_admin_screen",
						action = "kick_member",
                        player = member.name,
						faction_id = faction.faction_id,
					}
				}
            })
			if member.role ~= "leader" and member.role ~= "invited" then
				table.insert(buttons, {
					type = "button",
					caption = "Promote",
					actions = {
						on_click = {
							location = "faction_admin_screen",
							action = "promote_member",
                            player = member.name,
							old_role = member.role,
							faction_id = faction.faction_id,
						}
					}
				})
			end
			if member.role ~= "member" and member.role ~= "invited" then
				table.insert(buttons, {
					type = "button",
					caption = "Demote",
					actions = {
						on_click = {
							location = "faction_admin_screen",
							action = "demote_member",
							player = member.name,
							old_role = member.role,
							faction_id = faction.faction_id,
						}
					}
				})
            end
		elseif player.name == member.name then
			table.insert(buttons, {
				type = "button",
				caption = "Leave",
				actions = {
					on_click = {
						location = "faction_admin_screen",
						action = "kick_member",
                        player = member.name,
						faction_id = faction.faction_id,
					}
				}
			})
		end
		table.insert(members, buttons)
    end
	return members
end

local function draw_faction_admin_screen(player, faction_id)
	if player == nil then player = game.player end
	if player == nil then return false end

	local faction = get_faction(faction_id)

	local selected_tab_index = 1
    if player.gui.center["gridworld_faction_admin_screen"] ~= nil then
		selected_tab_index = player.gui.center["gridworld_faction_admin_screen"].content.faction_tabs.selected_tab_index
		player.gui.center["gridworld_faction_admin_screen"].destroy()
	end
	gui.build(player.gui.center, {
		{
            type = "frame",
			name = "gridworld_faction_admin_screen",
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
				name = "content",
				{
                    type = "tabbed-pane",
					name = "faction_tabs",
					style_mods = {
                        maximal_width = 750,
						height = 500,
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
							get_members_table(faction, player),
						}
					},
				},
			}
		}
    })
	player.gui.center["gridworld_faction_admin_screen"].content.faction_tabs.selected_tab_index = selected_tab_index
end
-- /c game.player.gui.screen.clear()

return draw_faction_admin_screen
