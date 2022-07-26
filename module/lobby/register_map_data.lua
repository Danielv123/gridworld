--[[
	Receive the current gridworld map state from RCON to visualize on the lobby server
]]
local function register_map_data(map_string)
	global.gridworld.map_data = game.json_to_table(map_string)
	log(global.gridworld.map_data)
end

return register_map_data
