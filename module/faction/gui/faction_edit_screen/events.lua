local clusterio_api = require("modules/clusterio/api")
local dialog_welcome_draw = require("modules/gridworld/lobby/gui/dialog_welcome/draw")
local show_progress = require("modules/gridworld/util/gui/show_progress/dialog")

local function on_gui_click(_, action, player)
	if player == nil then return end
	if action.location == "faction_edit_screen" then
		if action.action == "return_to_faction_screen" then
			gridworld.open_faction_admin_screen(player.name, action.faction_id)
		end
		if action.action == "save_faction" then
			-- Open edit dialog
			player.print("Saving faction...")
			show_progress.draw(player.name, "Saving faction", "Sending changes to cluster", 1, 3)
			local faction = global.gridworld.players[player.name].faction_creation
			clusterio_api.send_json("gridworld:update_faction", {
				faction_id = faction.faction_id,
				name = faction.name,
				open = faction.open,
				about = faction.about,
				player_name = player.name,
			})
		end
	end
end

local function on_gui_checked_state_changed(event, action, player)
	if action.location == "faction_edit_screen" then
		if action.action == "set_faction_open" then
			-- Toggle wether the created faction should be open or not
			global.gridworld.players[player.name].faction_creation.open = event.element.state
		end
	end
end

local function on_gui_text_changed(event, action, player)
	if action.location == "faction_edit_screen" then
		if action.action == "set_faction_name" then
			-- Set the name of the created faction
			global.gridworld.players[player.name].faction_creation.name = event.element.text
		end
		if action.action == "set_faction_about_header" then
			-- Set the header of the created faction
			global.gridworld.players[player.name].faction_creation.about.header = event.element.text
		end
		if action.action == "set_faction_about_description" then
			-- Set the description of the created faction
			global.gridworld.players[player.name].faction_creation.about.description = event.element.text
		end
		if action.action == "set_faction_about_rules" then
			-- Set the rules of the created faction
			global.gridworld.players[player.name].faction_creation.about.rules = event.element.text
		end
	end
end

return {
	on_gui_click = on_gui_click,
	on_gui_checked_state_changed = on_gui_checked_state_changed,
	on_gui_text_changed = on_gui_text_changed,
}
