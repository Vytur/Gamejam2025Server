const CursorManager = require('./cursorManager');
const CursorsSocketHandler = require('./cursorsSocketHandler');
const ClientInventoryManager = require('./clientInventoryManager');
const GridSocketHandler = require('./gridSocketHandler');
const InventorySocketHandler = require('./inventorySocketHandler');
const Grid = require('./grid');
const CorruptionManager = require('./corruptionManager');

// Store client viewports
let clients = {}; // { socketId: { x, y } }

//Sets up Socket.IO event handlers.
function setupSocketHandlers(io) {
  // Initialize managers and handlers
  const cursorManager = new CursorManager();
  const cursorsHandler = new CursorsSocketHandler(io, cursorManager);
  
  const inventoryManager = new ClientInventoryManager();
  const inventoryHandler = new InventorySocketHandler(io, inventoryManager);
  
  const grid = new Grid();
  const gridHandler = new GridSocketHandler(io, grid);

  // Create corruption manager and start cycle
  const corruptionManager = new CorruptionManager(grid);
  corruptionManager.startCorruptionCycle(io);

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle different aspects of client connection
    cursorsHandler.handleConnection(socket);
    inventoryHandler.handleConnection(socket);
    gridHandler.handleConnection(socket, clients, inventoryManager);

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
      
      //cursorsHandler.handleDisconnection(socket.id);
      inventoryHandler.handleDisconnection(socket.id);
      gridHandler.handleDisconnection(socket.id, clients);
      
      io.emit("remove_cursor", { id: socket.id });
    });
  });
}

module.exports = setupSocketHandlers;