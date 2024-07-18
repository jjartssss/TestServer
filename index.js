const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const PORT = process.env.PORT || 3001;

// Use CORS middleware
app.use(cors());

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.io server with CORS
const io = new Server(server, {
    cors: {
        origin: "https://chat-sun3.onrender.com",
        methods: ["GET", "POST"],
    }
});

// Handle socket connection
io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // Join room event
    socket.on("join_room", (data) => {
        socket.join(data);
        console.log(`User ${socket.id} joined room ${data}`);
    });

    // Send message event
    socket.on("send_message", (data) => {
        socket.to(data.room).emit("receive_message", data);
        console.log(`Message sent to room ${data.room}: ${data.message}`);
    });

    // Handle disconnect event
    socket.on("disconnect", () => {
        console.log(`User Disconnected: ${socket.id}`);
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`SERVER IS RUNNING ON PORT ${PORT}`);
});
