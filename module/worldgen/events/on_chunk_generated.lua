local function on_chunk_generated(event)
	-- Queue world limit recreation for a few ticks ahead to avoid lag spikes
	if global.gridworld.x_size ~= nil and global.gridworld.y_size ~= nil then
		local left = event.area.left_top.x < global.gridworld.x_size * (global.gridworld.world_x - 1)
		local top = event.area.left_top.y < global.gridworld.y_size * (global.gridworld.world_y - 1)
		local right = event.area.right_bottom.x > global.gridworld.x_size * global.gridworld.world_x
		local bottom = event.area.right_bottom.y > global.gridworld.y_size * global.gridworld.world_y
		if (left and not top and not bottom)
		or (top and not left and not right)
		or (right and not top and not bottom)
		or (bottom and not left and not right)
		then
			global.gridworld.world_limit_recreate_tick = event.tick + 65
		end
	end
end

return on_chunk_generated
