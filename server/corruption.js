const { GRID_SIZE } = require("./config");
const { tiles } = require("./grid");

/**
 * Applies corruption to the grid tiles periodically.
 */
function applyCorruption(io) {
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      if (tiles[x][y]) {
        const distance = Math.hypot(x - GRID_SIZE / 2, y - GRID_SIZE / 2);
        const corruptionChance = Math.min(distance / 100, 0.99);

        if (Math.random() < corruptionChance) {
          tiles[x][y] = false;
          io.emit("update_tile", { position: { x, y }, isPurified: false });
        }
      }
    }
  }
}

module.exports = applyCorruption;