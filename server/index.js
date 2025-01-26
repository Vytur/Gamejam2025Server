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

// Grid configuration
const gridSize = 10;
const tiles = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => false)
);

// Set the center tile to pure
tiles[Math.floor(gridSize / 2)][Math.floor(gridSize / 2)] = true;

// Keep track of connected users and their cursors
const users = {};

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    users[socket.id] = { position: { x: 0, y: 0 } };

    // Emit the connection event to Unity
    socket.emit('connection', { date: new Date().getTime(), data: "Hello Unity" });

    // Emit grid data to the client after connection
    socket.on('request_grid_data', () => {
        socket.emit('grid_data', {
            gridSize: gridSize,
            gridData: generateGridData()
        });
        console.log("data requested");
    });

    // Synchronize cursor movements
    socket.on('cursor_movement', (data) => {
        const { position } = data;
        if (position) {
            users[socket.id].position = position;
            // Broadcast to other clients
            socket.broadcast.emit('update_cursor', { id: socket.id, position });
        }
    });

    // Handle tile purification
    socket.on('purify_tile', (data) => {
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
            io.emit('update_tile', { position: { x, y }, isPurified: true });
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        delete users[socket.id];
        io.emit('remove_cursor', { id: socket.id });
    });
});

// Function to generate grid data for the client
function generateGridData() {
    const gridData = {};
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            gridData[`${x}_${y}`] = { isPurified: tiles[x][y] };
        }
    }
    return gridData;
}

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
                    io.emit('update_tile', { position: { x, y }, isPurified: false });
                }
            }
        }
    }
}, 1000); // Adjust the interval as needed

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});