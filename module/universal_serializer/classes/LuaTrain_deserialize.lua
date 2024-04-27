-- Deserializes a LuaTrain object.
---@param entity LuaEntity
---@param train_data table
---@return LuaTrain
local function LuaTrain_deserialize(entity, train_data)
	local train = entity.train
	if train == nil then
		error("Failed to find train")
	end

	train.manual_mode = train_data.manual_mode
	train.speed = train_data.speed
	train.schedule = train_data.schedule

	return train
end

return LuaTrain_deserialize
