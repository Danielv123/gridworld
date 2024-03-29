local clusterio_api = require("modules/clusterio/api")
local dialog_welcome_draw = require("modules/gridworld/lobby/gui/dialog_welcome/draw")
local dialog_faction_edit_screen_draw = require("modules/gridworld/faction/gui/faction_edit_screen/draw")
local invite_player_dialog_draw = require("modules/gridworld/faction/gui/invite_player_dialog/draw")

local function indexOf(array, value)
	for i, v in ipairs(array) do
		if v == value then
			return i
		end
	end
	return nil
end

local function on_gui_click(_, action, player)
	if player == nil then return end
	if action.location == "faction_admin_screen" then
		if action.action == "return_to_menu" then
			dialog_welcome_draw(player)
		end
		if action.action == "edit_faction" then
			-- Open edit dialog
			dialog_faction_edit_screen_draw(player, action.faction_id)
		end
		if action.action == "invite_player" then
			-- Open invite dialog
			invite_player_dialog_draw(player)
		end
		if action.action == "join_faction" then
			-- Join faction
			clusterio_api.send_json("gridworld:join_faction", {
				faction_id = action.faction_id,
				player_name = player.name,
			})
		end
		if action.action == "kick_member" then
			-- Kick the member from the faction - should maybe have a confirmation dialog?
			clusterio_api.send_json("gridworld:faction_kick_player", {
				faction_id = action.faction_id,
				player_name = action.player,
				requesting_player = player.name,
			})
		end
		if action.action == "promote_member" then
			-- Promote one step
			local roleTable = {"leader", "officer", "member", "invited"}
			local role = indexOf(roleTable, action.old_role)
			clusterio_api.send_json("gridworld:faction_change_member_role", {
				faction_id = action.faction_id,
				player_name = action.player,
				role = roleTable[role - 1],
				requesting_player = player.name,
			})
		end
		if action.action == "demote_member" then
			-- Demote one step
			local roleTable = {"leader", "officer", "member", "invited"}
			local role = indexOf(roleTable, action.old_role)
			clusterio_api.send_json("gridworld:faction_change_member_role", {
				faction_id = action.faction_id,
				player_name = action.player,
				role = roleTable[role + 1],
				requesting_player = player.name,
			})
		end
	end
end

return {
	on_gui_click = on_gui_click,
}
