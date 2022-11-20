local run_function = function (key, table, event, action, player)
	if table[key] ~= nil then
		table[key](event, action, player)
	end
end

return run_function
