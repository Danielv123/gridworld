local clusterio_api = require("modules/clusterio/api")
local out_of_bounds = require("modules/gridworld/util/out_of_bounds")

local function get_this_instance()
    local instance_id = clusterio_api.get_instance_id()
    return instance_id and global.server_select.instances[instance_id]
end
local function check_player_position()
	-- Periodically check players currently in the process of syncing
	for _,player in pairs(game.players) do
        if out_of_bounds(player.position.x, player.position.y) then
            --[[ Offer teleport through server_select ]]
            -- Figure out the target instance_id using edge_transports global state
            local instance_id
            for _, edge in pairs(global.edge_transports.edges) do
                -- north=6, east=0, south=2, and west=4
                -- Check north edge
                if edge.direction == 0 and edge.origin[2] > player.position.y then
                    instance_id = global.gridworld.neighbor_data.north
                -- Check east edge
                elseif edge.direction == 2 and edge.origin[1] < player.position.x then
                    instance_id = global.gridworld.neighbor_data.east
                -- Check south edge
                elseif edge.direction == 4 and edge.origin[2] < player.position.y then
                    instance_id = global.gridworld.neighbor_data.south
                -- Check west edge
                elseif edge.direction == 6 and edge.origin[1] > player.position.x then
                    instance_id = global.gridworld.neighbor_data.west
                end
            end

            if instance_id == nil then
                global.gridworld.players[player.name].has_been_offered_teleport = false
            end

            local instance = global.server_select.instances[instance_id]
            if instance_id ~= nil and not global.gridworld.players[player.name].has_been_offered_teleport then
                local this_instance = get_this_instance()
                -- Only try once
                global.gridworld.players[player.name].has_been_offered_teleport = true
                -- log("Attempting to connect player to "..serpent.block(instance))
                if instance == nil then
                    player.print("Error: Instance not found")
                elseif instance.status ~= "running" then
                    player.print("Error: This server is offline")
                elseif instance.game_version ~= this_instance.game_version then
                    player.print("Error: Instance is running version " .. instance.game_version)
                else
                    player.connect_to_server {
                        address = instance.public_address .. ":" .. instance.game_port,
                        name = instance.name
                    }
                    global.gridworld.players[player.name].send_teleport_on_quit = true
                    -- Save player position. Send to the destination server when player leaves the server
                    global.gridworld.players[player.name].teleport_destination = {
                        instance_id = instance_id,
                        x = player.position.x,
                        y = player.position.y,
                    }
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
end
local function receive_teleport(player)
    if global.gridworld.players[player.name].teleport_data ~= nil then
        local data = global.gridworld.players[player.name].teleport_data
        player.teleport({
            x = data.x,
            y = data.y
        }, 1) -- last argument is for surface
    end
end
local function receive_teleport_data(json)
    local data = game.json_to_table(json)

    if global.gridworld.players[data.player_name] == nil then
        global.gridworld.players[data.player_name] = {}
    end
    global.gridworld.players[data.player_name].teleport_data = data

    local player = game.get_player(data.player_name)
    if player and player.connected then
        receive_teleport(player)
    end
end

return {
    check_player_position = check_player_position,
    send_teleport_command_on_player_leave = send_teleport_command_on_player_leave,
    receive_teleport = receive_teleport,
    receive_teleport_data = receive_teleport_data,
}
