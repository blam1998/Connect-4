const express = require('express');
const app = express();
const http = require('http');
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server,{
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET","POST"],
    },
})

io.on("connection", (socket) => {
    const myRoom = "3";
    socket.on("send_message", (data) => {
        socket.to(data.room).emit("receive_message", data)
        console.log(myRoom);
    });

    socket.on("send_room", (data) =>{
        socket.rooms.clear();
        socket.join(data.room);
    });
})

server.listen(3001, () => {
    console.log("Server is running.");
})