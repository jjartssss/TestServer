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
        // origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    }
});

const rooms = {}; // Keeps track of players in each room

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // Function to generate a random position
    const getRandomPosition = () => ({
        top: Math.floor(Math.random() * 500), // Example range, adjust as needed
        left: Math.floor(Math.random() * 500), // Example range, adjust as needed
    });

    // Handle player joining a room
    socket.on('join_main_room', (data) => {
        const room = data.room;
        const player = {
            name: data.name,
            id: socket.id,
            position: getRandomPosition(), // Assign a random position
        };

        // Add player to the room
        socket.join(room);

        // Initialize room if not present
        if (!rooms[room]) {
            rooms[room] = [];
        }

        // Add player to the room's player list
        rooms[room].push(player);

        console.log(`${data.name} joined room ${data.room} with position ${player.position.top}, ${player.position.left}`);

        // Broadcast to other players in the room
        socket.to(room).emit('add_players', player);

        // Send the updated list of players to the newly joined player
        socket.broadcast.emit('initial_players_list', rooms[room]);
    });

    // Listen for position updates from the client
    socket.on('update_position', (position) => {
        // Update the stored position
        playerPositions[socket.id] = position;
        // Broadcast the updated position to all other clients
        socket.broadcast.emit('position_update', { id: socket.id, top: position.top, left: position.left });
        console.log(`${socket.id} moved to top: ${position.top}, left: ${position.left}`);
    });

    socket.on('send_message', (data) => {
        // Update the stored position
        // playerPositions[socket.id] = position;
        // Broadcast the updated position to all other clients
        // socket.broadcast.emit('position_update', { id: socket.id, top: position.top, left: position.left });
        // messages.append({name: data.name, message: data.message})
        io.emit('update_message', data);
        console.log(`${data.name} sent a message ${data.message} to room: ${data.room}`);
    });

    // Handle disconnect event
    socket.on("disconnect", () => {
        // Remove player from all rooms
        for (const room of Object.keys(rooms)) {
            const playerIndex = rooms[room].findIndex(player => player.id === socket.id);

            if (playerIndex !== -1) {
                const [removedPlayer] = rooms[room].splice(playerIndex, 1);
                socket.to(room).emit('remove_player', { id: removedPlayer.id });
                socket.broadcast.emit('remove_player', { id: removedPlayer.id });
                console.log(`User Disconnected: ${removedPlayer.name} from room ${room}`);
            }
        }
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`SERVER IS RUNNING ON PORT ${PORT}`);
});
