local clusterio_api = require("modules/clusterio/api")

local function send_player_position(player)
    clusterio_api.send_json("gridworld:send_player_position", {
        player_name = player.name,
        instance_id = clusterio_api.get_instance_id(),
        x = player.position.x,
        y = player.position.y,
    })
end

local function check_player_positions()
    for _,player in pairs(game.players) do
        if player.connected then
            send_player_position(player)
        end
    end
end

return {
    check_player_positions = check_player_positions,
    send_player_position = send_player_position,
}
