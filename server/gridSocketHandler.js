// server/gridSocketHandler.js
class GridSocketHandler {
    constructor(io, grid) {
      this.io = io;
      this.grid = grid;
    }
  
    /**
     * Handle grid-related socket events for a client connection
     * @param {Socket} socket - The connected socket
     * @param {Object} clients - Tracking of connected clients
     * @param {ClientInventoryManager} inventoryManager - Inventory management
     */
    handleConnection(socket, clients, inventoryManager) {
      const { GRID_SIZE } = require('./config');
  
      // Set initial position
      let startX = GRID_SIZE * 0.5;
      let startY = GRID_SIZE * 0.5;
      clients[socket.id] = { x: startX, y: startY };
  
      // Send initial grid chunk
      socket.emit("init_grid", {
        x: startX,
        y: startY,
        grid: this.grid.getFullGrid(),
      });
  
      // Handle tile color changes
      socket.on("change_tile", ({ x, y, color }) => {
        // Only allow converting corrupted tiles to pure
        if (color === 0) {
          if (this.grid.updateTile(x, y, color)) {
            // Randomly award coins (low probability)
            if (Math.random() < 0.1) { // 10% chance of getting coins
              const coinReward = this.calculateCoinReward(x, y);
              if (coinReward > 0) {
                inventoryManager.addCoins(socket.id, coinReward);               
  
                // Send updated inventory to the client
                socket.emit("inventory_update", inventoryManager.getInventory(socket.id));
              }
            }
  
            // Notify all clients about tile update
            Object.entries(clients).forEach(([id]) => {        
              this.io.to(id).emit("tile_update", { x, y, color });    
            });
          } else {
            socket.emit("invalid_move", { x, y });
          }
        } else {
          socket.emit("invalid_move", { x, y });
        }
      });
    }
  
    /**
     * Calculate coin reward based on tile position
     * @param {number} x - X coordinate of the tile
     * @param {number} y - Y coordinate of the tile
     * @returns {number} Coin reward amount
     */
    calculateCoinReward(x, y) {
      const { GRID_SIZE } = require('./config');
      
      // Calculate distance from center
      const centerX = GRID_SIZE / 2;
      const centerY = GRID_SIZE / 2;
      const distance = Math.hypot(x - centerX, y - centerY);
      
      // Tiles further from center have potential for higher rewards
      const maxReward = Math.ceil(5 * (distance / (GRID_SIZE / 2)));
      
      // Random reward up to the calculated max
      return Math.ceil(Math.random() * maxReward);
    }
  
    /**
     * Handle client disconnection
     * @param {string} socketId - ID of the disconnecting client
     * @param {Object} clients - Tracking of connected clients
     */
    handleDisconnection(socketId, clients) {
      delete clients[socketId];
    }
  }
  
  module.exports = GridSocketHandler;