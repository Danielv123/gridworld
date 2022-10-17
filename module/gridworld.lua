--[[

Gridworld

When a player enters a map, generate neighboring maps and connections

]]

gridworld = {}

-- flib.gui
local gui = require("flib/gui")
local clusterio_api = require("modules/clusterio/api")
local out_of_bounds = require("util/out_of_bounds")
local edge_teleport = require("edge_teleport")
local player_tracking = require("player_tracking")
local create_world_limit = require("worldgen/create_world_limit")
local create_spawn = require("worldgen/create_spawn")
local populate_neighbor_data = require("populate_neighbor_data")
local map = require("map/map")
local lobby = require("lobby")
local factions = require("factions")
local util_gui = require("util/gui")
local setup_forces = require("faction/setup_forces")
local claim_server = require("faction/claim_server")
local unclaim_server = require("faction/unclaim_server")
local get_player_faction = require("faction/get_player_faction")

-- Declare globals to make linter happy
game = game
global = global
-- defines = defines
log = log

gridworld.events = {}
gridworld.events[clusterio_api.events.on_server_startup] = function()
	-- Set up global table
	if global.gridworld == nil then
		global.gridworld = {}
	end
	if global.gridworld.world_limit_version == nil then
		global.gridworld.world_limit_version = 0
	end
	if global.gridworld.spawn_version == nil then
		global.gridworld.spawn_version = 0
	end
	if global.gridworld.players == nil then
		global.gridworld.players = {}
	end
	if global.gridworld.neighbor_data == nil then
		global.gridworld.neighbor_data = {}
	end
	if global.gridworld.factions == nil then
		global.gridworld.factions = {}
	end
	if global.gridworld.claiming_faction == nil then
		global.gridworld.claiming_faction = {
			claimed = false,
			faction_id = nil,
			claim_start = nil,
			stored_fp = nil,
			claim_cost = nil,
		}
	end

	-- Fun factions inititalization
	setup_forces()
end
gridworld.events[defines.events.on_player_joined_game] = function(event)
	local player = game.get_player(event.player_index)

	if global.gridworld.players[player.name] == nil then
		global.gridworld.players[player.name] = {}
	end

	if not global.gridworld.lobby_server then
		edge_teleport.receive_teleport(player)
		player_tracking.send_player_position(player)
	else
		lobby.gui.dialog_welcome.draw(player)
	end
end
gridworld.events[defines.events.on_player_left_game] = function(event)
	local player = game.get_player(event.player_index)
	local teleport_destination = global.gridworld.players[player.name].teleport_destination
	if teleport_destination ~= nil then
		edge_teleport.send_teleport_command_on_player_leave(player.name, teleport_destination.instance_id, teleport_destination.x, teleport_destination.y)
	end
end
gridworld.events[defines.events.on_built_entity] = function(event)
	if not global.gridworld.lobby_server then
		local entity = event.created_entity
		if not (entity and entity.valid) then return end

		local player = false
		if event.player_index then player = game.players[event.player_index] end

		local x = entity.position.x
		local y = entity.position.y

		if out_of_bounds(x,y) then
			if player and player.valid then
				-- Tell the player what is happening
				-- if player then player.print("Attempted building outside allowed area (placed at x "..x.." y "..y..")") end
				-- kill entity, try to give it back to the player though
				if not player.mine_entity(entity, true) then
					entity.destroy()
				end
			else
				-- it wasn't placed by a player, we can't tell em whats wrong
				entity.destroy()
			end
		end
	end
end
gridworld.events[defines.events.on_gui_click] = function(event)
	local player = game.players[event.player_index]
	local action = gui.read_action(event)
	if action then
		lobby.gui.on_gui_click(event, action, player)
		factions.gui.on_gui_click(event, action, player)
		util_gui.on_gui_click(event, action, player)
	end
end
gridworld.events[defines.events.on_gui_checked_state_changed] = function(event)
	local player = game.players[event.player_index]
	local action = gui.read_action(event)
	if action then
		lobby.gui.on_gui_checked_state_changed(event, action, player)
		factions.gui.on_gui_checked_state_changed(event, action, player)
	end
end
gridworld.events[defines.events.on_gui_text_changed] = function(event)
	local player = game.players[event.player_index]
	local action = gui.read_action(event)
	if action then
		lobby.gui.on_gui_text_changed(event, action, player)
		factions.gui.on_gui_text_changed(event, action, player)
	end
end
gridworld.on_nth_tick = {}
gridworld.on_nth_tick[37] = function()
	if not global.gridworld.lobby_server then
		-- Periodically check players position for cross server teleport
		edge_teleport.check_player_position()
	end
end
gridworld.on_nth_tick[121] = function()
	if not global.gridworld.lobby_server then
		-- Update player positions on the map
		player_tracking.check_player_positions()
	end
end

-- Plugin API
gridworld.create_world_limit = create_world_limit
gridworld.create_spawn = create_spawn
gridworld.populate_neighbor_data = populate_neighbor_data
gridworld.prepare_teleport_data = edge_teleport.prepare_teleport_data
gridworld.receive_teleport_data = edge_teleport.receive_teleport_data
gridworld.dump_mapview = map.dump_mapview
gridworld.ask_for_teleport = edge_teleport.ask_for_teleport
gridworld.register_lobby_server = lobby.register_lobby_server
gridworld.register_map_data = lobby.register_map_data
gridworld.sync_faction = factions.sync_faction
gridworld.open_faction_admin_screen = factions.open_faction_admin_screen
gridworld.show_progress = util_gui.dialog_show_progress.draw
gridworld.hmi_show_status = function()
	factions.gui.dialog_faction_server_status.draw(game.get_player("Danielv123"), get_player_faction(game.get_player("Danielv123")).faction_id)
end
gridworld.hmi_hide_status = function()
	game.player.gui.left.clear()
end
gridworld.claim_server = claim_server
gridworld.unclaim_server = unclaim_server

return gridworld
