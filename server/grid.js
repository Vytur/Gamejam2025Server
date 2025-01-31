const { GRID_SIZE } = require("./config");

class Grid {
  constructor() {
    // Simulated Grid (0 = pure, 1 = corrupted)
    this.grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(1));

    // Set the center tile to pure (starting point)
    this.grid[Math.floor(GRID_SIZE / 2)][Math.floor(GRID_SIZE / 2)] = 0;
  }

  /**
   * Check if a tile is adjacent to a pure (blue) tile
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {boolean} Whether the tile is adjacent to a pure tile
   */
  isAdjacentToPure(x, y) {
    const directions = [
      [0, -1], [-1, 0], [1, 0], [0, 1] // Up, Left, Right, Down
    ];
    return directions.some(([dx, dy]) => {
      let nx = x + dx;
      let ny = y + dy;
      return nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE && this.grid[ny][nx] === 0;
    });
  }

  /**
   * Get a full copy of the grid
   * @returns {number[][]} Deep copy of the grid
   */
  getFullGrid() {
    return this.grid.map(row => [...row]);
  }

  /**
   * Update a tile
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} color - Tile color (0 = pure, 1 = corrupted)
   * @returns {boolean} Whether the tile was successfully updated
   */
  updateTile(x, y, color) {
    if (
      x >= 0 && x < GRID_SIZE &&
      y >= 0 && y < GRID_SIZE &&
      this.grid[y][x] === 1 && // Only change corrupted tiles
      color === 0 && // Only allow corrupted → pure conversion
      this.isAdjacentToPure(x, y) // Must be adjacent to pure
    ) {
      this.grid[y][x] = color;
      return true; // Tile successfully changed
    }
    return false; // Invalid move
  }
}

module.exports = Grid;