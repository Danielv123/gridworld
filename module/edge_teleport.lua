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
			for id, edge in pairs(global.edge_transports.edges) do
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
				end
			end
		else
			-- We are within bounds, reset teleport offer debouncer
			global.gridworld.players[player.name].has_been_offered_teleport = false
		end
	end
end

return {
	check_player_position = check_player_position,
}
