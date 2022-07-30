local clusterio_api = require("modules/clusterio/api")
local dialog_welcome_draw = require("modules/gridworld/lobby/gui/dialog_welcome/draw")

local function on_gui_click(_, action, player)
    if player == nil then return end
	if action.action == "new_game_dialog_create_faction" then
		game.print("Creating faction...")
		clusterio_api.send_json("gridworld:create_faction", {
			player_name = player.name,
		})
	end
    if action.location == "new_game_dialog" then
        if action.action == "return_to_menu" then
            dialog_welcome_draw(player)
        end
    end
end

local function on_gui_checked_state_changed(event, action, player)
    if action.location == "new_game_dialog" then
        if action.action == "open" then
            -- Toggle wether the created faction should be open or not
            global.gridworld.players[player.name].faction_creation.open = event.element.state
        end
    end
end

local function on_gui_text_changed(event, action, player)
    if action.location == "new_game_dialog" then
        if action.action == "set_faction_name" then
            -- Set the name of the created faction
            global.gridworld.players[player.name].faction_creation.name = event.element.text
        end
    end
end

return {
    on_gui_click = on_gui_click,
    on_gui_checked_state_changed = on_gui_checked_state_changed,
    on_gui_text_changed = on_gui_text_changed,
}
