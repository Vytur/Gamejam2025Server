const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const PORT = 11100;

// Create an HTTP server and bind it to Express
const server = http.createServer(app);

// Bind Socket.IO to the same HTTP server
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Serve a basic test route for HTTP
app.get("/", (req, res) => {
  res.send("Socket.IO server is running with Express!");
});

// Grid configuration
const gridSize = 10;
const tiles = Array.from({ length: gridSize }, () =>
  Array.from({ length: gridSize }, () => false)
);

// Set the center tile to pure
tiles[Math.floor(gridSize / 2)][Math.floor(gridSize / 2)] = true;

// Keep track of connected users and their cursors
const players = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  //   players[socket.id] = { position: { x: 0, y: 0 } };

  // Emit a connection event to Unity
  socket.emit("connection", {
    date: new Date().getTime(),
    data: "Hello Unity",
  });

  // Example: Listen for 'hello' event from Unity
  socket.on("hello", (data) => {
    console.log(`Received 'hello' event: ${JSON.stringify(data)}`);
    socket.emit("hello", { date: new Date().getTime(), data: data });
  });

  // Synchronize cursor movements
  socket.on("cursor_movement", (data) => {
    const cursorData = JSON.parse(data);
    console.log(`Received x ` + cursorData);
    if (cursorData) {
      players[cursorData.playerId] = cursorData;
      // Broadcast to other clients
      //   socket.broadcast.emit("update_cursor", cursorData);
      console.log(`Received x ` + cursorData);
      socket.emit("update_cursor", cursorData);
    }
  });

  // Handle tile purification
  socket.on("purify_tile", (data) => {
    const { position } = data;

    if (!position) return;

    const { x, y } = position;
    if (!tiles[x] || !tiles[x][y]) return; // Invalid tile

    const neighbors = [
      { x: 0, y: 1 },
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: -1, y: 0 },
    ];

    // Check if any neighbor is purified
    const canPurify = neighbors.some((dir) => {
      const nx = x + dir.x;
      const ny = y + dir.y;
      return tiles[nx]?.[ny] ?? false;
    });

    if (canPurify) {
      tiles[x][y] = true; // Set the tile to purified
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

// Corruption mechanics
setInterval(() => {
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      if (tiles[x][y]) {
        // Determine chance of corruption based on distance from the center
        const distance = Math.hypot(x - gridSize / 2, y - gridSize / 2);
        const corruptionChance = Math.min(distance / 100, 0.99);

        if (Math.random() < corruptionChance) {
          tiles[x][y] = false; // Corrupt the tile
          io.emit("update_tile", { position: { x, y }, isPurified: false });
        }
      }
    }
  }
}, 1000); // Adjust the interval as needed

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
