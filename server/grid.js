const { GRID_SIZE } = require("./config");

// Grid storage
const tiles = [];

/**
 * Initializes the grid with default values.
 */
function initializeGrid() {
  for (let x = 0; x < GRID_SIZE; x++) {
    tiles[x] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      tiles[x][y] = false;
    }
  }

  // Set the center tile to purified
  const center = Math.floor(GRID_SIZE / 2);
  tiles[center][center] = true;
}

/**
 * Checks if a tile can be purified based on its neighbors.
 */
function canPurifyTile(x, y) {
  const neighbors = [
    { x: 0, y: 1 },
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: -1, y: 0 },
  ];

  return neighbors.some((dir) => {
    const nx = x + dir.x;
    const ny = y + dir.y;
    return tiles[nx]?.[ny] ?? false;
  });
}

module.exports = { tiles, initializeGrid, canPurifyTile };