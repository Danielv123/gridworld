local draw = require("modules/gridworld/faction/gui/faction_server_status/draw")
local events = require("modules/gridworld/faction/gui/faction_server_status/events")
local get_player_faction = require("modules/gridworld/faction/get_player_faction")

local function update(player)
	local faction = get_player_faction(player)
	if faction == nil then
		return
	end
	local frame = player.gui.left["gridworld_faction_server_status"]
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
