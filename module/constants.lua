local custom_events = {
	on_faction_claimed_server = script.generate_event_name(),
	on_faction_unclaimed_server = script.generate_event_name(),
}
return {
	generation_version = 2,
	load_balancing_weights = {
		inserter = 1,
		["transport-belt"] = 0.01,
		["mining-drill"] = 1,
		furnace = 1,
		["assembling-machine"] = 2,
		lab = 2,
		["train-stop"] = 5,
		pipe = 0.1,
		reactor = 20,
	},
	custom_events = custom_events,
}
