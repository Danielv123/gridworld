local get_player_faction = require("modules/gridworld/faction/get_player_faction")

local function set_player_permission_group(player)
	if player.admin then
		player.permission_group = game.permissions.get_group("Admin")
		player.print("Setting permission group to Admin")
		return
	end
	-- Get claiming faction
	local claiming_faction_id = global.gridworld.claiming_faction.faction_id
	local faction = get_player_faction(player)
	if faction and claiming_faction_id == faction.faction_id then
		player.permission_group = game.permissions.get_group("Owner")
		player.print("Setting permission group to Owner")
	else
		player.permission_group = game.permissions.get_group("Guest")
		player.print("Setting permission group to Guest")
	end
end

return set_player_permission_group
