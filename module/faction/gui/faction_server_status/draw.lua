local gui = require("modules/gridworld/flib/gui")
local get_faction = require("modules/gridworld/faction/get_faction")
local clusterio_api = require("modules/clusterio/api")

local function draw_faction_server_status(player, faction_id)
	if player == nil then player = game.player end
	if player == nil then return false end

	local player_faction = get_faction(faction_id)
	local server_is_claimed = global.gridworld.claiming_faction.claimed
	local claiming_faction = get_faction(global.gridworld.claiming_faction.faction_id)
	local server_is_claimed_by_player = server_is_claimed and global.gridworld.claiming_faction.faction_id == faction_id

	local content = {
		type = "flow",
		direction = "vertical",
		name = "gridworld_faction_server_status",
		{
			type = "button",
			caption = "Join lobby server",
			style = "green_button",
			actions = {
				on_click = {
					location = "faction_server_status",
					action = "join_lobby_server",
				},
			},
		},
		{
			type = "label",
			caption = "Server name: "..clusterio_api.get_instance_name(),
		},
		{
			type = "label",
			caption = "UPS: " .. "TODO",
		},
	}
	if server_is_claimed and claiming_faction ~= nil then
		-- Server is claimed, are we part of the claiming faction?
		if player_faction ~= nil and server_is_claimed_by_player then
			table.insert(content, {
				type = "label",
				caption = "Faction: " .. claiming_faction.name,
				style = "heading_1_label"
			})
			table.insert(content, {
				type = "label",
				caption = "Cost per day: " .. 100 .. " fp",
			})
		else
			table.insert(content, {
				type = "label",
				caption = "Faction: " .. claiming_faction.name,
			})
		end
	else
		-- Server is not claimed
		table.insert(content, {
			type = "label",
			caption = "Unclaimed server",
		})
		-- are we part of a faction that can claim it?
		if player_faction ~= nil then
			table.insert(content, {
				type = "button",
				name = "gridworld_faction_claim_server",
				caption = "Claim server",
				actions = {
					on_click = {
						location = "faction_server_status",
						action = "claim_server",
						faction_id = faction_id,
						player = player.name,
					}
				},
			})
		end
	end

	-- Draw status screen
	player.gui.left.clear()
	gui.build(player.gui.left, {
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
					-- {
					-- 	type = "sprite-button",
					-- 	sprite = "utility/confirm_slot",
					-- 	style = "tool_button",
					-- 	actions = {
					-- 		on_click = {
					-- 			location = "faction_server_status",
					-- 			action = "save_faction",
					-- 		}
					-- 	},
					-- },
					{
						type = "sprite-button",
						sprite = "utility/close_white",
						style = "frame_action_button",
						actions = {
							on_click = {
								location = "faction_server_status",
								action = "close",
								faction_id = faction_id,
							}
						},
					},
				},
			},
			content,
		}
	})
end
-- /c game.player.gui.screen.clear()

return draw_faction_server_status
