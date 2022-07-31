local function get_faction(faction_id)
	local factions = global.gridworld.factions
	for k,v in pairs(factions) do
		if v.faction_id == faction_id then
			return v
		end
	end
	return nil
end

return get_faction
