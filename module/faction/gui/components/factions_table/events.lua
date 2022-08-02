local function on_gui_click(_, action, player)
	if player == nil then return end
	if action.location == "factions_table" then
		if action.action == "view_faction" then
			gridworld.open_faction_admin_screen(player.name, action.faction_id)
		end
	end
end

return {
	on_gui_click = on_gui_click,
}
