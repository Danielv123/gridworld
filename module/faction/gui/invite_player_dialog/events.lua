local clusterio_api = require("modules/clusterio/api")
local get_player_faction = require("modules/gridworld/faction/get_player_faction")

local function on_gui_click(_, action, player)
	if player == nil then return end
	if action.location == "invite_player_dialog" then
		if action.action == "close_dialog" then
			player.gui.center.gridworld_invite_player_dialog.destroy()
        end
		if action.action == "invite_button" then
            local faction = get_player_faction(player)
            local table = player.gui.center
				.gridworld_invite_player_dialog
                .content
				.gridworld_invite_player_table
            local name = table.gridworld_invite_player_textfield.text
			local role = table.gridworld_invite_player_role.selected_index
            clusterio_api.send_json("gridworld:faction_invite_player", {
				faction_id = faction.faction_id,
                player_name = name,
                role = ({"leader", "officer", "member", "invited"})[role],
				requesting_player = player.name,
			})
		end
	end
end

return {
    on_gui_click = on_gui_click,
}
