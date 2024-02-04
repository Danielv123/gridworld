local function on_player_left_game()
	global.gridworld.load_balancing.last_activity_tick = game.tick
end
return on_player_left_game
