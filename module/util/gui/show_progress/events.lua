local dialog_welcome_draw = require("modules/gridworld/lobby/gui/dialog_welcome/draw")

local function on_gui_click(_, action, player)
	if player == nil then return end
	if action.location == "progress_bar" then
		if action.action == "return_to_menu" then
			-- Return to the welcome screen if this is the lobby server
			if global.gridworld.lobby_server then
				player.gui.center.clear()
				dialog_welcome_draw(player)
			else
				player.gui.center.clear()
			end
		end
	end
end

return {
	on_gui_click = on_gui_click,
}
