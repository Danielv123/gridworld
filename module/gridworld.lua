--[[

Gridworld

When a player enters a map, generate neighboring maps and connections

]]

gridworld = {}

-- flib.gui
local gui = require("flib/gui")
local clusterio_api = require("modules/clusterio/api")
local out_of_bounds = require("util/out_of_bounds")
local constants = require("modules/gridworld/constants")
local edge_teleport = require("edge_teleport")
local player_tracking = require("player_tracking")
local populate_neighbor_data = require("populate_neighbor_data")
local map = require("map/map")
local lobby = require("lobby")
local factions = require("factions")
local util_gui = require("util/gui")
local setup_forces = require("faction/setup_forces")
local setup_permission_groups = require("faction/building_restrictions/setup_permission_groups")
local claim_server = require("faction/claim_server")
local unclaim_server = require("faction/unclaim_server")
local gui_events = require("gui/events")
local set_player_permission_group = require("faction/building_restrictions/set_player_permission_group")
local worldgen = require("worldgen/index")
local load_balancing = require("load_balancing/load_balancing")

gridworld.events = {}
gridworld.events[clusterio_api.events.on_server_startup] = function()
	-- Set up global table
	if global.gridworld == nil then
		global.gridworld = {}
	end
	if global.gridworld.world_limit == nil then
		global.gridworld.world_limit = {}
	end
	if global.gridworld.world_limit.version == nil then
		global.gridworld.world_limit.version = 1
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
	if global.gridworld.map == nil then
		global.gridworld.map = {
			added_entities_to_update = nil,
			removed_entities_to_update = nil,
			entity_registrations = {},
		}
	end
	if global.gridworld.map.entity_registrations == nil then
		global.gridworld.map.entity_registrations = {}
	end

	-- Fun factions inititalization
	setup_forces()
	setup_permission_groups()

	-- Load balancing
	load_balancing.events.on_server_startup()
end
gridworld.events[defines.events.on_player_joined_game] = function(event)
	local player = game.get_player(event.player_index)

	if global.gridworld.players[player.name] == nil then
		global.gridworld.players[player.name] = {}
	end

	if not global.gridworld.lobby_server then
		edge_teleport.receive_teleport(player)
		player_tracking.send_player_position(player)
		gui_events.on_player_joined_game(event, nil, player)
		set_player_permission_group(player)
		load_balancing.events.on_player_joined_game(event, player)
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
	load_balancing.events.on_player_left_game(event, player)
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
		else
			factions.on_built_entity(event)
			if entity.valid then
				load_balancing.events.on_built_entity(event, entity)
				map.events.on_built_entity(event, entity)
			end
		end
	end
end
gridworld.events[defines.events.on_biter_base_built] = function(event)
	if not global.gridworld.lobby_server then
		local entity = event.entity
		if entity.valid then
			map.events.on_biter_base_built(event, entity)
		end
	end
end
gridworld.events[defines.events.on_entity_cloned] = function(event)
	if not global.gridworld.lobby_server then
		local entity = event.destination
		if entity.valid then
			load_balancing.events.on_entity_cloned(event, entity)
			map.events.on_entity_cloned(event, entity)
		end
	end
end
gridworld.events[defines.events.on_robot_built_entity] = function(event)
	if not global.gridworld.lobby_server then
		local entity = event.created_entity
		if entity.valid then
			load_balancing.events.on_robot_built_entity(event, entity)
			map.events.on_robot_built_entity(event, entity)
		end
	end
end
gridworld.events[defines.events.script_raised_built] = function(event)
	if not global.gridworld.lobby_server then
		local entity = event.entity
		if entity.valid then
			load_balancing.events.script_raised_built(event, entity)
			map.events.script_raised_built(event, entity)
		end
	end
end
gridworld.events[defines.events.script_raised_revive] = function(event)
	if not global.gridworld.lobby_server then
		local entity = event.entity
		if entity.valid then
			load_balancing.events.script_raised_revive(event, entity)
			map.events.script_raised_revive(event, entity)
		end
	end
end
gridworld.events[defines.events.on_entity_destroyed] = function(event)
	if not global.gridworld.lobby_server then
		-- This event is triggered after the entity is gone, so we can't use it to get the entity
		-- Instead, use the registration_number stored previously.
		map.events.on_entity_destroyed(event) -- Run before load balancing to hijack its event registrations
		load_balancing.events.on_entity_destroyed(event)
	end
end
-- "Soft" entity removal events, used for cleanup of things we havent registered
gridworld.events[defines.events.on_player_mined_entity] = function(event)
	if not global.gridworld.lobby_server then
		map.events.on_player_mined_entity(event)
	end
end
gridworld.events[defines.events.on_robot_mined_entity] = function(event)
	if not global.gridworld.lobby_server then
		map.events.on_robot_mined_entity(event)
	end
end
gridworld.events[defines.events.on_entity_died] = function(event)
	if not global.gridworld.lobby_server then
		map.events.on_entity_died(event)
	end
end
gridworld.events[defines.events.on_pre_robot_exploded_cliff] = function(event)
	if not global.gridworld.lobby_server then
		map.events.on_pre_robot_exploded_cliff(event)
	end
end
gridworld.events[defines.events.on_gui_click] = function(event)
	local player = game.players[event.player_index]
	local action = gui.read_action(event)
	if action then
		lobby.gui.on_gui_click(event, action, player)
		factions.gui.on_gui_click(event, action, player)
		util_gui.on_gui_click(event, action, player)
		gui_events.on_gui_click(event, action, player)
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
gridworld.events[defines.events.on_chunk_generated] = function(event)
	if not global.gridworld.lobby_server then
		worldgen.events.on_chunk_generated(event)
	end
end
gridworld.events[defines.events.on_tick] = function(event)
	if not global.gridworld.lobby_server then
		worldgen.events.on_tick(event)
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
		load_balancing.events.on_nth_tick()
	end
end
gridworld.on_nth_tick[243] = function()
	if not global.gridworld.lobby_server then
		-- Update entity data on map
		map.events.on_nth_tick()
	end
end

-- Handle custom events
gridworld.events[constants.custom_events.on_faction_claimed_server] = function(event)
	if not global.gridworld.lobby_server then
		load_balancing.events.custom.on_faction_claimed_server(event)
	end
end
gridworld.events[constants.custom_events.on_faction_unclaimed_server] = function(event)
	if not global.gridworld.lobby_server then
		load_balancing.events.custom.on_faction_unclaimed_server(event)
	end
end

-- Plugin API
gridworld.create_world_limit = worldgen.create_world_limit
gridworld.create_spawn = worldgen.create_spawn
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
	factions.gui.dialog_faction_server_status.draw(game.player)
end
gridworld.hmi_hide_status = function()
	game.player.gui.left.clear()
end
gridworld.claim_server = claim_server
gridworld.unclaim_server = unclaim_server
gridworld.map = {
	dump_entities = map.dump_entities,
	dump_mapview = map.dump_mapview,
}

return gridworld
