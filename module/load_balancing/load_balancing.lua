--[[
	Determine when the server should be stopped to conserve reources or moved to a different host.
]]
local on_built_entity = require("modules/gridworld/load_balancing/events/on_built_entity")
local on_entity_cloned = require("modules/gridworld/load_balancing/events/on_entity_cloned")
local on_entity_destroyed = require("modules/gridworld/load_balancing/events/on_entity_destroyed")
local on_player_joined_game = require("modules/gridworld/load_balancing/events/on_player_joined_game")
local on_player_left_game = require("modules/gridworld/load_balancing/events/on_player_left_game")
local on_robot_built_entity = require("modules/gridworld/load_balancing/events/on_robot_built_entity")
local on_server_startup = require("modules/gridworld/load_balancing/events/on_server_startup")
local script_raised_built = require("modules/gridworld/load_balancing/events/script_raised_built")
local script_raised_revive = require("modules/gridworld/load_balancing/events/script_raised_revive")

return {
	events = {
		on_built_entity = on_built_entity,
		on_entity_cloned = on_entity_cloned,
		on_entity_destroyed = on_entity_destroyed,
		on_player_joined_game = on_player_joined_game,
		on_player_left_game = on_player_left_game,
		on_robot_built_entity = on_robot_built_entity,
		on_server_startup = on_server_startup,
		script_raised_built = script_raised_built,
		script_raised_revive = script_raised_revive,
	},
}
