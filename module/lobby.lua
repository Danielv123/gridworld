--[[
	The lobby server functionality is implemented here.
	The lobby server is always online and has auto_start enabled by default. When players join the lobby server they will be presented with a GUI explaining how the server works and how to play on it.
	A new player will be presented with a "New game" button. Upon pressing the button a new profile will be generated.
	On the profile view you can see your current character, player statistics and your location on the grid. To start, press "Join server". The server will start and a dialog prompting to connect to the server will appear. The player can click "Confirm" or press E to connect to the server.
]]

local register_lobby_server = require("lobby/register_lobby_server")
local register_map_data = require("lobby/register_map_data")
local gui = require("lobby/gui")

return {
	register_lobby_server = register_lobby_server,
	register_map_data = register_map_data,
	gui = gui,
}
