const { GRID_SIZE, VIEWPORT_SIZE } = require("./config");
const { updateTile, getFullGrid } = require('./grid');

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

    // Handle tile color changes
    socket.on("change_tile", ({ x, y, color }) => {
      if (updateTile(x, y, color)) {
        // Only notify clients who can see this tile
        Object.entries(clients).forEach(([id, { x: vx, y: vy }]) => {        
            io.to(id).emit("tile_update", { x, y, color });    
        });
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
