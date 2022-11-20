local function insert_cell(dest_table, width, caption)
	table.insert(dest_table, {
		type = "flow",
		style_mods = {
			horizontal_align = "center",
			width = width,
		},
		{
			type = "label",
			caption = caption,
			style_mods = {
				horizontal_align = "center",
			},
		},
	})
end

local function draw_invites_table()
	local factions_table = {
		type = "table",
		column_count = 4,
		draw_vertical_lines = true,
		draw_horizontal_lines = true,
		{
			type = "label",
			caption = "ID",
		},
		{
			type = "label",
			caption = "Name",
		},
		{
			type = "label",
			caption = "Player count",
		},
		{
			type = "label",
			caption = "",
		},
	}

	local factions = global.gridworld.factions
	for _,faction in pairs(factions) do
		-- Get player count
		local playercount = 0
		local is_invited = false
		for _, member in pairs(faction.members) do
			if member.role ~= "invited" then -- Invited but not accepted is not counted as a member
				playercount = playercount + 1
			elseif member.name:lower() == game.player.name:lower() then
				is_invited = true
			end
		end
		if is_invited then
			insert_cell(factions_table, 100, faction.faction_id)
			insert_cell(factions_table, 200, faction.name)
			insert_cell(factions_table, 80, playercount)
			table.insert(factions_table, {
				type = "button",
				caption = "Accept",
				actions = {
					on_click = {
						location = "invites_table",
						action = "accept_invite",
						player = game.player.name,
						faction_id = faction.faction_id,
					}
				}
			})
		end
	end

	return factions_table
end

return draw_invites_table
