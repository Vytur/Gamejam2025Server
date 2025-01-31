// server/cursorsSocketHandler.js
class CursorsSocketHandler {
  constructor(io, cursorManager) {
    this.io = io;
    this.cursorManager = cursorManager;
  }

  handleConnection(socket) {
    const startPosition = {
      x: process.env.GRID_SIZE * 0.5 || 500,
      y: process.env.GRID_SIZE * 0.5 || 500,
    };

    // Add new cursor
    this.cursorManager.addCursor(socket.id, startPosition);

    socket.on("request_cursors", () => {
      // Send existing cursors to new player
      socket.emit(
        "cursors_init",
        this.cursorManager.getOtherCursors(socket.id)
      );

      // Broadcast new cursor to others
      socket.broadcast.emit("new_cursor", {
        id: socket.id,
        ...startPosition,
      });
    });

    this.setupCursorEvents(socket);
  }

  setupCursorEvents(socket) {
    socket.on("cursor_move", (position) => {
      this.cursorManager.updateCursorPosition(socket.id, position);
      socket.broadcast.emit("cursor_update", {
        id: socket.id,
        ...position,
      });
    });

    socket.on("disconnect", () => {
      this.cursorManager.removeCursor(socket.id);
      this.io.emit("remove_cursor", { id: socket.id });
    });
  }
}

module.exports = CursorsSocketHandler;
