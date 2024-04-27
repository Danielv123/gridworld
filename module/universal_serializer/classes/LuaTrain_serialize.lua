-- Serializes a LuaTrain object.
---@param train LuaTrain
---@return table
local function LuaTrain_serialize(train)
	local train_data = {
		manual_mode = train.manual_mode,
		speed = train.speed,
		schedule = train.schedule,
	}

	return train_data
end

return LuaTrain_serialize
