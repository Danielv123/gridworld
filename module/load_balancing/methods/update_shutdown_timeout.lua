local function update_shutdown_timeout()
	local server_is_claimed = global.gridworld.claiming_faction.claimed
	if server_is_claimed then
		global.gridworld.load_balancing.inactivity_shutdown_ticks = 48 * 60 * 60 * 60 -- 48 hours
	else
		global.gridworld.load_balancing.inactivity_shutdown_ticks = 30 * 60 * 60 -- 30 minutes
	end
end
return update_shutdown_timeout
