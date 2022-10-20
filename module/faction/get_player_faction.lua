local function get_player_faction(player)
	local factions = global.gridworld.factions
	for _, v in pairs(factions) do
		for _, member in pairs(v.members) do
			if member.name:lower() == player.name:lower() then
				return v
			end
		end
	end
	return nil
end

return get_player_faction
