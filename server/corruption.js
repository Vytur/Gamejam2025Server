const { GRID_SIZE } = require("./config");
const { grid } = require("./grid");

const centerX = Math.floor(GRID_SIZE / 2);
const centerY = Math.floor(GRID_SIZE / 2);

// Direction vectors for only the 4 adjacent tiles (no diagonals)
const DIRECTIONS = [
  [-1, 0], // up
  [1, 0],  // down
  [0, -1], // left
  [0, 1]   // right
];

/**
* Applies corruption to tiles neighboring pure (0) tiles.
* Only checks 4 adjacent tiles (up, down, left, right).
* Uses a two-phase approach to avoid cascading effects within the same update.
* @param {Object} io - Socket.io instance for emitting updates
*/
function applyCorruption(io) {
  // Phase 1: Identify tiles to corrupt
  const tilesToCorrupt = new Set();
  
  for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
          // Skip processing non-corrupted tiles
          if (grid[y][x] !== 1) continue;
          
          // Check the 4 adjacent tiles
          for (const [dy, dx] of DIRECTIONS) {
              const newY = y + dy;
              const newX = x + dx;
              
              // Bounds check using single if statement
              if (newX >= 0 && newX < GRID_SIZE && 
                  newY >= 0 && newY < GRID_SIZE && 
                  !(newX === centerX && newY === centerY)) {
                  
                  // If neighbor is pure, mark it for corruption
                  if (grid[newY][newX] === 0) {
                      tilesToCorrupt.add(`${newY},${newX}`);
                  }
              }
          }
      }
  }
  
  // Phase 2: Apply corruption to identified tiles
  for (const coordStr of tilesToCorrupt) {
      const [y, x] = coordStr.split(',').map(Number);
      
      // Apply corruption chance based on distance
      const distance = Math.hypot(x - GRID_SIZE / 2, y - GRID_SIZE / 2);
      const corruptionChance = Math.min(distance / 100, 0.99);
      
      if (Math.random() < corruptionChance) {
          grid[y][x] = 1; // Set to "corrupted" state
          io.emit("tile_update", { x, y, color: 1 });
      }
  }
}

module.exports = applyCorruption;