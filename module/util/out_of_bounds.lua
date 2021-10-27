local function out_of_bounds(x,y)
	if x > global.gridworld.x_size * global.gridworld.world_x
	or x < global.gridworld.x_size * (global.gridworld.world_x - 1)
	or y > global.gridworld.y_size * global.gridworld.world_y
	or y < global.gridworld.y_size * (global.gridworld.world_y - 1)
	then
		return true
	else
		return false
	end
end

return out_of_bounds
