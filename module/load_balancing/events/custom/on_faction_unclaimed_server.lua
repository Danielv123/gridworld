local update_shutdown_timeout = require("modules/gridworld/load_balancing/methods/update_shutdown_timeout")

local function on_faction_unclaimed_server()
	update_shutdown_timeout()
end
return on_faction_unclaimed_server
