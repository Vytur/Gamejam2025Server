const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = 11100;

// Create an HTTP server and bind it to Express
const server = http.createServer(app);

// Bind Socket.IO to the same HTTP server
const io = new Server(server);

// Middleware for authentication using the 'token' query parameter
io.use((socket, next) => {
    if (socket.handshake.query.token === "UNITY") {
        next();
    } else {
        next(new Error("Authentication error"));
    }
});

// Serve a basic test route for HTTP
app.get('/', (req, res) => {
    res.send('Socket.IO server is running with Express!');
});

// Handle Socket.IO connections
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Emit a connection event to Unity
    socket.emit('connection', { date: new Date().getTime(), data: "Hello Unity" });

    // Example: Listen for 'hello' event from Unity
    socket.on('hello', (data) => {
        console.log(`Received 'hello' event: ${JSON.stringify(data)}`);
        socket.emit('hello', { date: new Date().getTime(), data: data });
    });

    // Example: Spin an object in Unity
    socket.on('spin', () => {
        socket.emit('spin', { date: new Date().getTime() });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});