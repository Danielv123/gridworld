local util_gui = require("modules/gridworld/util/gui")

local function on_gui_click(_, action, player)
	if player == nil then return end
	if action.location == "faction_server_status" then
		if action.action == "close" then
			game.player.gui.left.clear()
		end
		if action.action == "claim_sector" then
			-- Open claim dialog
			player.print("Claiming sector...")
            util_gui.dialog_show_progress.draw(player.name, "Claiming sector", "Sending changes to cluster", 1, 3)
			-- TODO: Claim sector
		end
	end
end

return {
	on_gui_click = on_gui_click,
}
