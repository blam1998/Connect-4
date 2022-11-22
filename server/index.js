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

const myRooms = new Map();

io.on("connection", (socket) => {

    socket.on("send_message", (data) => {
        if (!data.userName){
            socket.emit("enter_name");
            return;
        }

        socket.in(data.room).emit("receive_message", data); //to everyone in room
        socket.emit("receive_message", data); //to self
    });

    socket.on("send_room", (data) => {
        const room = data.room;
        socket.rooms.clear();
        socket.join(data.room);
        socket.emit("receive_room", {room})
    })

    socket.on("send_userName", (data) => {
        const id = socket.id;
        const name = data.userName;
        console.log(name);
        socket.emit("receive_userName", {name, id})
    })

    socket.on("send_leaveRoom", (data) => {
        socket.leave(data.room);
    });


    socket.on("send_gameStart", (data) => {
        
    });
})

server.listen(3001, () => {
    console.log("Server is running.");
})
