local draw = require("modules/gridworld/faction/gui/faction_admin_screen/draw")
local events = require("modules/gridworld/faction/gui/faction_admin_screen/events")
local get_player_faction = require("modules/gridworld/faction/get_player_faction")

local function update(player)
	local faction = get_player_faction(player)
	if faction == nil then
		return
	end
	local frame = player.gui.center["gridworld_faction_admin_screen"]
	if frame == nil then
		return
	end
	draw(player, faction.faction_id)
end

return {
	draw = draw,
	events = events,
	update = update,
}
