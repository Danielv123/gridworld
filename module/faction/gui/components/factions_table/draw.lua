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

local function draw_factions_table()
	local factions_table = {
		type = "table",
		column_count = 5,
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
			caption = "Open",
		},
		{
			type = "label",
			caption = "",
		},
	}

	local factions = global.gridworld.factions
	for _,faction in pairs(factions) do
		insert_cell(factions_table, 100, faction.faction_id)
		insert_cell(factions_table, 200, faction.name)
		-- Get player count
		local playercount = 0
		for _,v in pairs(faction.members) do
			if v.rank ~= "invited" then -- Invited but not accepted is not counted as a member
				playercount = playercount + 1
			end
		end
		insert_cell(factions_table, 80, playercount)
		insert_cell(factions_table, 50, tostring(faction.open))
		table.insert(factions_table, {
			type = "sprite-button",
			sprite = "utility/search_icon",
			style = "tool_button",
			actions = {
				on_click = {
					location = "factions_table",
					action = "view_faction",
					faction_id = faction.faction_id,
				}
			},
		})
	end

	return factions_table
end

return draw_factions_table
