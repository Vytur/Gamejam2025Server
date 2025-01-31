const { GRID_SIZE } = require("./config");

// Simulated Grid (0 = pure, 1 = corrupted)
let grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(1));

// Set the center tile to pure (starting point)
grid[Math.floor(GRID_SIZE / 2)][Math.floor(GRID_SIZE / 2)] = 0;

// Function to check if a tile is adjacent to pure (blue) tile
function isAdjacentToPure(x, y) {
  const directions = [
      [0, -1], [-1, 0], [1, 0], [0, 1] // Up, Left, Right, Down
  ];
  return directions.some(([dx, dy]) => {
      let nx = x + dx;
      let ny = y + dy;
      return nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE && grid[ny][nx] === 0;
  });
}

function getFullGrid() {
  return grid.map(row => [...row]);
}

// Update a tile (only if it's corrupted AND adjacent to a pure tile)
function updateTile(x, y, color) {
  if (
      x >= 0 && x < GRID_SIZE &&
      y >= 0 && y < GRID_SIZE &&
      grid[y][x] === 1 && // Only change corrupted tiles
      color === 0 && // Only allow corrupted → pure conversion
      isAdjacentToPure(x, y) // Must be adjacent to pure
  ) {
      grid[y][x] = color;
      return true; // Tile successfully changed
  }
  return false; // Invalid move
}

module.exports = { grid, updateTile, getFullGrid };