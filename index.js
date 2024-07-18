const express = require('express');
const app = express();

const http = require('http');
const {Server} = require('socket.io');
const PORT = process.env.PORT || 3001;
const cors = require('cors'); // prevent connection errors
app.use(cors())
const server = http.createServer(app) // create http?

const io = new Server(server, {
    cors: { // specify the methods or functions 
        origin: "https://chat-sun3.onrender.com/",
        methods: ["GET", "POST"],
    }
}); 

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);


    socket.on("join_room", (data) => {
        socket.join(data);
    });

    socket.on("send_message", (data) => {
        //console.log(data);
        socket.to(data.room).emit("receive_message", data); // broadcast is send to other but not self
    })
})

server.listen(PORT, () => {
    console.log("SERVER IS RUNNING");
})