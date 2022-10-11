-- Setup forces used by the faction module

local function setup_forces()
	if not game.forces["faction_claimed"] then
		game.create_force("faction_claimed")
	end
	local faction_claimed = game.forces["faction_claimed"]

	if not game.forces["faction_friendly"] then
		game.create_force("faction_friendly")
	end
	local faction_friendly = game.forces["faction_friendly"]

	faction_claimed.set_cease_fire(faction_friendly, true)

	faction_friendly.set_cease_fire(faction_claimed, true)
	faction_friendly.set_friend(faction_claimed, true)
end

return setup_forces
