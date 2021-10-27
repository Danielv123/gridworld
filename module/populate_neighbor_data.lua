local function populate_neighbor_data(north, south, east, west)
    log("Got neighbor dara "..(north or "nil").." "..(south or "nil").." "..(east or "nil").." "..(west or "nil"))
    global.gridworld.neighbor_data = {
        north = north,
        south = south,
        east = east,
        west = west,
    }
end

return populate_neighbor_data
