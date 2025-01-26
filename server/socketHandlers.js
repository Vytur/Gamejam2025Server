const { tiles, canPurifyTile } = require("./grid");
const players = {};

/**
 * Sets up Socket.IO event handlers.
 */
function setupSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Emit connection acknowledgment
    socket.emit("connection", {
      date: new Date().getTime(),
      data: "Hello Unity",
    });

    // Handle "hello" event
    socket.on("hello", (data) => {
      console.log(`Received 'hello' event: ${JSON.stringify(data)}`);
      socket.emit("hello", { date: new Date().getTime(), data });
    });

    // Handle cursor movement
    socket.on("cursor_movement", (data) => {
      try {
        const cursorData = JSON.parse(data);
        if (cursorData) {
          players[cursorData.playerId] = cursorData;
          console.log(`Received cursor movement:`, cursorData);
          socket.emit("update_cursor", cursorData);
        }
      } catch (err) {
        console.error("Failed to parse cursor movement data:", err);
      }
    });

    // Handle tile purification
    socket.on("purify_tile", (data) => {
      const { position } = data;

      if (!position) return;

      const { x, y } = position;
      if (!tiles[x] || !tiles[x][y]) return; // Invalid tile

      if (canPurifyTile(x, y)) {
        tiles[x][y] = true;
        io.emit("update_tile", { position: { x, y }, isPurified: true });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
      delete players[socket.id];
      io.emit("remove_cursor", { id: socket.id });
    });
  });
}

module.exports = setupSocketHandlers;