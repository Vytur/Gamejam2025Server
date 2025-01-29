const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { PORT } = require("./config");
const setupSocketHandlers = require("./socketHandlers");
const applyCorruption = require("./corruption");

// Initialize Express and Socket.IO
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Serve basic test route
app.get("/", (req, res) => {
  res.send("Socket.IO server is running with Express!");
});

// Set up Socket.IO event handlers
setupSocketHandlers(io);

// Start corruption mechanic
//setInterval(() => applyCorruption(io), 1000);

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});