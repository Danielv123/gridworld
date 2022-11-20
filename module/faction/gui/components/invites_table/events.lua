local clusterio_api = require("modules/clusterio/api")

local function on_gui_click(_, action, player)
	if player == nil then return end
	if action.location == "invites_table" then
		if action.action == "accept_invite" then
			-- Join faction
			clusterio_api.send_json("gridworld:join_faction", {
				faction_id = action.faction_id,
				player_name = player.name,
			})
		end
	end
end

return {
	on_gui_click = on_gui_click,
}
