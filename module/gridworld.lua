--[[

Gridworld

When a player enters a map, generate neighboring maps and connections

]]

local clusterio_api = require("modules/clusterio/api")
local out_of_bounds = require("modules/gridworld/util/out_of_bounds")
local edge_teleport = require("modules/gridworld/edge_teleport")
local create_world_limit = require("modules/gridworld/worldgen/create_world_limit")
local create_spawn = require("modules/gridworld/worldgen/create_spawn")
local populate_neighbor_data = require("modules/gridworld/populate_neighbor_data")
local map = require("modules/gridworld/map/map")

gridworld = {}
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
end
gridworld.events[defines.events.on_player_joined_game] = function(event)
    local player = game.get_player(event.player_index)

	if global.gridworld.players[player.name] == nil then
		global.gridworld.players[player.name] = {}
	end
	edge_teleport.receive_teleport(player)
end
gridworld.events[defines.events.on_player_left_game] = function(event)
    local player = game.get_player(event.player_index)
	local teleport_destination = global.gridworld.players[player.name].teleport_destination
	if teleport_destination ~= nil then
		edge_teleport.send_teleport_command_on_player_leave(player.name, teleport_destination.instance_id, teleport_destination.x, teleport_destination.y)
	end
end
gridworld.events[defines.events.on_built_entity] = function(event)
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
gridworld.on_nth_tick = {}
gridworld.on_nth_tick[37] = function()
	-- Periodically check players position for cross server teleport
	edge_teleport.check_player_position()
end

-- Plugin API
gridworld.create_world_limit = create_world_limit
gridworld.create_spawn = create_spawn
gridworld.populate_neighbor_data = populate_neighbor_data
gridworld.receive_teleport_data = edge_teleport.receive_teleport_data
gridworld.dump_mapview = map.dump_mapview

return gridworld
