return {
	events = {
		on_tick = require("modules/gridworld/universal_serializer/events/on_tick"),
	},
	LuaEntity = {
		serialize = require("modules/gridworld/universal_serializer/classes/LuaEntity_serialize"),
		deserialize = require("modules/gridworld/universal_serializer/classes/LuaEntity_deserialize"),
	},
	LuaTrain = {
		serialize = require("modules/gridworld/universal_serializer/classes/LuaTrain_serialize"),
		deserialize = require("modules/gridworld/universal_serializer/classes/LuaTrain_deserialize"),
	}
}
