const express = require('express');
const app = express();

const http = require('http');
const {Server} = require('socket.io');

const cors = require('cors'); // prevent connection errors
app.use(cors())
const server = http.createServer(app) // create http?

const io = new Server(server, {
    cors: { // specify the methods or functions 
        origin: "http://localhost:3000",
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

server.listen(3001, () => {
    console.log("SERVER IS RUNNING");
})