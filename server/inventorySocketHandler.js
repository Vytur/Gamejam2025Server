// inventorySocketHandler.js
class InventorySocketHandler {
    constructor(io, inventoryManager) {
      this.io = io;
      this.inventoryManager = inventoryManager;
    }
  
    /**
     * Handle inventory-related socket events for a client connection
     * @param {Socket} socket - The connected socket
     */
    handleConnection(socket) {
      // Initialize client inventory on connection
      this.inventoryManager.initializeClient(socket.id);
  
      // Handle inventory-related events
      socket.on("request_inventory", () => {
        socket.emit("inventory_init", 
            this.inventoryManager.getInventory(socket.id)
          );
      });
  
      // Optional: Add more inventory-related events
      // For example:
      // - Buying items
      // - Selling items
      // - Transferring coins
    }
  
    /**
     * Handle client disconnection
     * @param {string} socketId - ID of the disconnecting client
     */
    handleDisconnection(socketId) {
      this.inventoryManager.removeClient(socketId);
    }
  }
  
  module.exports = InventorySocketHandler;