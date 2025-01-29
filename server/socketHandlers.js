const { GRID_SIZE, VIEWPORT_SIZE } = require("./config");
const { getViewport, updateTile, getFullGrid } = require('./grid');

// Store client viewports
let clients = {}; // { socketId: { x, y } }

/**
 * Sets up Socket.IO event handlers.
 */
function setupSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Set initial position
    let startX = GRID_SIZE * 0.5;
    let startY = GRID_SIZE * 0.5;
    clients[socket.id] = { x: startX, y: startY };

    // Send initial grid chunk
    socket.emit("init_grid", {
      x: startX,
      y: startY,
      grid: getFullGrid(),
    });

    // Handle movement
    socket.on("move", ({ dx, dy }) => {
      let client = clients[socket.id];
      if (!client) return;

      let newX = Math.max(
        0,
        Math.min(GRID_SIZE - VIEWPORT_SIZE, client.x + dx)
      );
      let newY = Math.max(
        0,
        Math.min(GRID_SIZE - VIEWPORT_SIZE, client.y + dy)
      );
      console.log(`Received move request: dx=${dx}, dy=${dy}, new_x=${newX}, new_y=${newY}`);

      if (dx !== client.x || dy !== client.y) {
        clients[socket.id] = { x: dx, y: dy };

        // Send newly visible tiles
        socket.emit("update_viewport", {
          x: dx,
          y: dy,
          grid: getViewport(dx, dy),
        });
      }
    });

    // Handle tile color changes
    socket.on("change_tile", ({ x, y, color }) => {
      console.log(`Received tile change request: x=${x}, y=${y}, color=${color}`);
      if (updateTile(x, y, color)) {
        // Only notify clients who can see this tile
        Object.entries(clients).forEach(([id, { x: vx, y: vy }]) => {
          if (
            x >= vx &&
            x < vx + VIEWPORT_SIZE &&
            y >= vy &&
            y < vy + VIEWPORT_SIZE
          ) {
            io.to(id).emit("tile_update", { x, y, color });
          }
        });
        socket.emit("tile_update", { x, y, color });
      } else {
        socket.emit("invalid_move", { x, y });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
      delete clients[socket.id];
      io.emit("remove_cursor", { id: socket.id });
    });
  });
}

module.exports = setupSocketHandlers;
