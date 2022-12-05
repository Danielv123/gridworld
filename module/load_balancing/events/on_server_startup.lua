local update_shutdown_timeout = require("modules/gridworld/load_balancing/methods/update_shutdown_timeout")

local function on_server_startup()
	-- Set up global table
	if global.gridworld == nil then
		global.gridworld = {}
	end
	if global.gridworld.load_balancing == nil then
		global.gridworld.load_balancing = {
			load_factor = 0, -- Approximate load of this server
			inactivity_shutdown_ticks = 30 * 60 * 60, -- 30 minutes
			last_activity_tick = game.tick,
			entity_destroyed_registrations = {},
		}
	else
		global.gridworld.load_balancing.last_activity_tick = game.tick
		update_shutdown_timeout()
	end
end
return on_server_startup
