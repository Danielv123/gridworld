local function on_gui_click(event, action)
	local player = event.player
	if player == nil then return end
	if action.action == "join_latest_server" then
		game.print("Joining server...")
	end
end

return on_gui_click
