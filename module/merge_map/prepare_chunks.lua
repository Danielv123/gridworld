local function prepare_chunks(left_top, right_bottom)
	local chunk_position_left_top = {math.floor(left_top[1] / 32), math.floor(left_top[2] / 32)}
	local chunk_position_right_bottom = {math.floor(right_bottom[1] / 32), math.floor(right_bottom[2] / 32)}

	for x = chunk_position_left_top[1], chunk_position_right_bottom[1] do
		for y = chunk_position_left_top[2], chunk_position_right_bottom[2] do
			-- Mark generation as complete
			game.surfaces[1].set_chunk_generated_status({x, y}, defines.chunk_generated_status.entities)
		end
	end

	-- Delete all entities in area in case anything was generated
	local entities = game.surfaces[1].find_entities({left_top, right_bottom})
	for _, entity in pairs(entities) do
		entity.destroy()
	end

	rcon.print("Area prepared")
end
return prepare_chunks
