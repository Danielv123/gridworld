local clusterio_api = require("modules/clusterio/api")

local function on_nth_tick()
	-- If the server has been inactive for a while and no players are connected, stop it to conserve resources
	if next(game.connected_players) == nil and game.tick - global.gridworld.load_balancing.inactivity_shutdown_ticks > global.gridworld.load_balancing.last_activity_tick then
		clusterio_api.send_json("gridworld:load_balancing", {
			action = "stop_server",
			load_factor = global.gridworld.load_balancing.load_factor,
		})
		log("Stopping server due to inactivity")
	end
end
return on_nth_tick
