const fs = require("fs-extra");
const path = require("path");

module.exports = function registerTileServer(app, tilesPath) {
    // Serve tiles
    app.get("/api/gridworld/tiles/:z/:y/:x.png", async (req, res) => {
        try {
            let file = await fs.readFile(path.resolve(tilesPath, `z${req.params.z}x${req.params.x}y${req.params.y}.png`));
            res.send(file);
        } catch (e) {
            res.status(404).send("Tile not found");
        }
    })
}
