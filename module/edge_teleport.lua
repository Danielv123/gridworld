local clusterio_api = require("modules/clusterio/api")
local out_of_bounds = require("modules/gridworld/util/out_of_bounds")

local function perform_edge_teleport(player)
	global.gridworld.players[player.name].has_been_offered_teleport = true
    clusterio_api.send_json("gridworld:perform_edge_teleport", {
        player_name = player.name,
        player_x_position = player.position.x,
		player_y_position = player.position.y,
    })
end

local function receive_teleport(player)
	if global.gridworld.players[player.name].teleport_data ~= nil then
		local data = global.gridworld.players[player.name].teleport_data
		player.teleport({
			x = data.x,
			y = data.y
        }, 1) -- last argument is for surface
		global.gridworld.players[player.name].teleport_data = nil
	end
end

local function check_player_position()
	-- Periodically check players currently in the process of syncing
	for _,player in pairs(game.connected_players) do
		if out_of_bounds(player.position.x, player.position.y) then
			if not global.gridworld.players[player.name].has_been_offered_teleport and player.character ~= nil then
				for _, edge in pairs(global.edge_transports.edges) do
					-- north=6, east=0, south=2, and west=4
					-- Check north edge
					if edge.direction == 0 and edge.origin[2] > player.position.y then
						player.print("Looking for northbound teleport")
						perform_edge_teleport(player)
					-- Check east edge
					elseif edge.direction == 2 and edge.origin[1] < player.position.x then
						player.print("Looking for eastbound teleport")
						perform_edge_teleport(player)
					-- Check south edge
					elseif edge.direction == 4 and edge.origin[2] < player.position.y then
						player.print("Looking for southbound teleport")
						perform_edge_teleport(player)
					-- Check west edge
					elseif edge.direction == 6 and edge.origin[1] > player.position.x then
						player.print("Looking for westbound teleport")
						perform_edge_teleport(player)
					end
				end
			end
		else
			-- We are within bounds, reset teleport offer debouncer
			global.gridworld.players[player.name].has_been_offered_teleport = false
			global.gridworld.players[player.name].send_teleport_on_quit = false
		end
	end
end
local function send_teleport_command_on_player_leave(player_name, instance_id, x, y)
	clusterio_api.send_json("gridworld:send_teleport_command", {
		player_name = player_name,
		instance_id = instance_id,
		x = x,
		y = y,
	})
	global.gridworld.players[player_name].has_been_offered_teleport = false
	global.gridworld.players[player_name].send_teleport_on_quit = false
	global.gridworld.players[player_name].teleport_data = nil
end
--[[
	Called when the master has determined which instance the player should be offered a teleport to.
	Data is forwarded to the correct instance once the player leaves this server
]]
local function prepare_teleport_data(json)
	local data = game.json_to_table(json)
	global.gridworld.players[data.player_name].send_teleport_on_quit = true
	-- Save player position. Send to the destination server when player leaves the server
	global.gridworld.players[data.player_name].teleport_destination = {
		instance_id = data.instance_id,
		x = data.x,
		y = data.y,
	}
end
local function receive_teleport_data(json)
	local data = game.json_to_table(json)

	if global.gridworld.players[data.player_name] == nil then
		global.gridworld.players[data.player_name] = {}
	end
	global.gridworld.players[data.player_name].teleport_data = data

	local player = game.get_player(data.player_name)
	if player and player.connected and player.character ~= nil then
		receive_teleport(player)
	end
end
local function ask_for_teleport(player_name)
	global.gridworld.players[player_name].has_been_offered_teleport = false
end

return {
	check_player_position = check_player_position,
	send_teleport_command_on_player_leave = send_teleport_command_on_player_leave,
    receive_teleport = receive_teleport,
	prepare_teleport_data = prepare_teleport_data,
	receive_teleport_data = receive_teleport_data,
	ask_for_teleport = ask_for_teleport,
}
