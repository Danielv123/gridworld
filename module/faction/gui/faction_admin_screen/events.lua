local dialog_welcome_draw = require("modules/gridworld/lobby/gui/dialog_welcome/draw")
local dialog_faction_edit_screen_draw = require("modules/gridworld/faction/gui/faction_edit_screen/draw")

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
	end
end

return {
	on_gui_click = on_gui_click,
}
