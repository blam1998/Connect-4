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

    var myRoom = "";

    socket.on("send_message", (data) => {
        socket.in(data.room).emit("receive_message", data); //to everyone in room
        socket.emit("receive_message", data); //to self
    });

    socket.on("send_room", (data) =>{
        socket.rooms.clear();
        socket.join(data.room);
        socket.emit("receive_room", data)
        myRoom = data.room;
    });

    socket.on("send_userName", (data) => {
        const id = socket.id;
        const name = data.name
        socket.emit("receive_userName", {name, id});
        socket.in(myRoom).emit("receive_userName", {name, id});
    })
})

server.listen(3001, () => {
    console.log("Server is running.");
})
