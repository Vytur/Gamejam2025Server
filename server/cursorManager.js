// server/cursorManager.js
class CursorManager {
    constructor() {
      this.cursors = new Map(); // Using Map for better key-value handling
    }
  
    addCursor(socketId, position) {
      this.cursors.set(socketId, {
        x: position.x,
        y: position.y,
        cursorX: position.x,
        cursorY: position.y
      });
    }
  
    updateCursorPosition(socketId, position) {
      const cursor = this.cursors.get(socketId);
      if (cursor) {
        cursor.cursorX = position.x;
        cursor.cursorY = position.y;
      }
    }
  
    removeCursor(socketId) {
      this.cursors.delete(socketId);
    }
  
    getCursor(socketId) {
      return this.cursors.get(socketId);
    }
  
    getAllCursors() {
      return Array.from(this.cursors.entries()).map(([id, data]) => ({
        id,
        x: data.cursorX,
        y: data.cursorY
      }));
    }
  
    getOtherCursors(excludeId) {
      return Array.from(this.cursors.entries())
        .filter(([id]) => id !== excludeId)
        .map(([id, data]) => ({
          id,
          x: data.cursorX,
          y: data.cursorY
        }));
    }
  }
  
  module.exports = CursorManager;