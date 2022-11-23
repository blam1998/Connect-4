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

        console.log(data.room);
        
        socket.in(data.room).emit("receive_message", data); //to everyone in room
        //socket.emit("receive_message", data); //to self
    });

    socket.on("send_room", (data) => {
        var oldRoom = socket.rooms.values()
        oldRoom = oldRoom.next();
        const room = data.room;


        //If room is full, return error message and don't join room.
        if(myRooms.get(room) && myRooms.get(room).length >= 2){
            socket.emit("room_full", {room});
            return;
        }

        //Leave old room before you join another room. each socket can be in 1 room at a time.
        if (myRooms.get(oldRoom.value) && myRooms.get(oldRoom.value).indexOf(socket.id) > -1){
            myRooms.get(oldRoom.value).splice(myRooms.get(oldRoom.value).indexOf(socket.id),1);
        }

        socket.leave(oldRoom.value);

        //Joining a new room by adding their socket ID to their room number.
        // If myRoom already exists but my socket id is not in there, and the room isn't full. add my socket ID to that room.
        if (myRooms.get(room) && myRooms.get(room).length < 2 && myRooms.get(room).indexOf(socket.id) == -1){
            myRooms.get(room).push(socket.id);
        }
        else{
            myRooms.set(room,[socket.id]);
        }

        socket.join(room);

        socket.emit("clear_chat");
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
