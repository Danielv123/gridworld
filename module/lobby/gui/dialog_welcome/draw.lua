local gui = require("modules/gridworld/flib/gui")
local get_tab_welcome = require("tab_welcome")
local get_tab_about = require("tab_about")
local get_tab_factions = require("tab_factions")
local get_tab_invites = require("tab_invites")

local function draw_welcome(player)
	local isnt_lobby = not global.gridworld.lobby_server
	if player == nil then player = game.player end

	local header = {
		type = "flow",
		direction = "horizontal",
		{
			type = "flow",
			direction = "horizontal",
			{
				type = "label",
				style = "frame_title",
				caption = "Welcome",
				ignored_by_interaction = true,
			},
		},
	}
	if isnt_lobby then
		-- Insert clsoe button
		table.insert(header, {
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
						location = "dialog_welcome",
						action = "close",
					}
				},
			},
		})
	end

	local tabbed_pane = {
		type = "tabbed-pane",
		style_mods = {
			maximal_width = 750,
			height = 500,
		},
		elem_mods = {
			selected_tab_index = 1,
		},
	}
	-- Welcome (lobby server)
	if not isnt_lobby then
		table.insert(tabbed_pane, get_tab_welcome(player))
	end
	-- About page
	table.insert(tabbed_pane, get_tab_about())
	-- Factions list
    table.insert(tabbed_pane, get_tab_factions())
    -- Invites list
	table.insert(tabbed_pane, get_tab_invites())

	player.gui.center.clear()
	gui.build(player.gui.center, {
		{
			type = "frame",
			direction = "vertical",
			ref = {"window"},
			header,
			-- Content
			{
				type = "flow",
				tabbed_pane,
			}
		}
	})
end
-- /c game.player.gui.screen.clear()

return draw_welcome
