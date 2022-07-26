local create_spawn = require("modules/gridworld/lobby/worldgen/create_spawn")

local function register_lobby_server()
	global.gridworld.lobby_server = true
	create_spawn()
end

return register_lobby_server
