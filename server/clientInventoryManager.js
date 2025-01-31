// server/clientInventoryManager.js
class ClientInventoryManager {
    constructor() {
      // Store client inventories and coins
      this.inventories = {};
    }
  
    /**
     * Initialize inventory for a new client
     * @param {string} socketId - Unique socket ID of the client
     * @param {number} initialCoins - Starting number of coins for the client
     */
    initializeClient(socketId, initialCoins = 100) {
      this.inventories[socketId] = {
        coins: initialCoins,
        items: [] // Array to store client's inventory items
      };
    }
  
    /**
     * Add coins to a client's balance
     * @param {string} socketId - Unique socket ID of the client
     * @param {number} amount - Number of coins to add
     * @returns {number} New coin balance
     */
    addCoins(socketId, amount) {
      if (!this.inventories[socketId]) {
        throw new Error(`Client ${socketId} not initialized`);
      }
      this.inventories[socketId].coins += amount;
      return this.inventories[socketId].coins;
    }
  
    /**
     * Subtract coins from a client's balance
     * @param {string} socketId - Unique socket ID of the client
     * @param {number} amount - Number of coins to subtract
     * @returns {boolean} Whether the transaction was successful
     */
    subtractCoins(socketId, amount) {
      if (!this.inventories[socketId]) {
        throw new Error(`Client ${socketId} not initialized`);
      }
      
      if (this.inventories[socketId].coins >= amount) {
        this.inventories[socketId].coins -= amount;
        return true;
      }
      return false;
    }
  
    /**
     * Get a client's current coin balance
     * @param {string} socketId - Unique socket ID of the client
     * @returns {number} Current coin balance
     */
    getCoins(socketId) {
      if (!this.inventories[socketId]) {
        throw new Error(`Client ${socketId} not initialized`);
      }
      return this.inventories[socketId].coins;
    }
  
    /**
     * Add an item to a client's inventory
     * @param {string} socketId - Unique socket ID of the client
     * @param {Object} item - Item to add to inventory
     */
    addItem(socketId, item) {
      if (!this.inventories[socketId]) {
        throw new Error(`Client ${socketId} not initialized`);
      }
      this.inventories[socketId].items.push(item);
    }
  
    /**
     * Remove an item from a client's inventory
     * @param {string} socketId - Unique socket ID of the client
     * @param {string} itemId - Unique identifier of the item to remove
     * @returns {boolean} Whether the item was successfully removed
     */
    removeItem(socketId, itemId) {
      if (!this.inventories[socketId]) {
        throw new Error(`Client ${socketId} not initialized`);
      }
      
      const index = this.inventories[socketId].items.findIndex(item => item.id === itemId);
      if (index !== -1) {
        this.inventories[socketId].items.splice(index, 1);
        return true;
      }
      return false;
    }
  
    /**
     * Get a client's entire inventory
     * @param {string} socketId - Unique socket ID of the client
     * @returns {Object} Client's inventory with coins and items
     */
    getInventory(socketId) {
      if (!this.inventories[socketId]) {
        throw new Error(`Client ${socketId} not initialized`);
      }
      return this.inventories[socketId];
    }
  
    /**
     * Remove a client's inventory when they disconnect
     * @param {string} socketId - Unique socket ID of the client
     */
    removeClient(socketId) {
      delete this.inventories[socketId];
    }
  }
  
  module.exports = ClientInventoryManager;