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

var myRooms = new Map();
var waitingLobby = new Map();
var nameMap = new Map();

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

        const playerSocket1 = myRooms.get(room) ? myRooms.get(room)[0] : null;
        const playerSocket2 = myRooms.get(room) ? myRooms.get(room)[1] : null;
        const playerName1 = playerSocket1 ? nameMap.get(playerSocket1) : null;
        const playerName2 = playerSocket2 ? nameMap.get(playerSocket2) : null;

        var nameArray = [playerName1, playerName2]
        socket.join(room);
        socket.in(room).emit("room_info", {roomInfo : nameArray})
        socket.emit("clear_chat");
        socket.emit("receive_room", data)
    })

    socket.on("send_userName", (data) => {
        const id = socket.id;
        const name = data.userName;

        nameMap.set(id, name);

        socket.emit("receive_userName", {name, id})
        socket.emit("update_name", {id: socket.id, name: data.userName})
    })

    socket.on("send_leaveRoom", (data) => {
        socket.leave(data.room);
    });


    socket.on("send_gameStart", (data) => {
        //data: id,room

        //if room doesn't exist, add room and socket id.
        if (!waitingLobby.get(data.room)){
            waitingLobby.set(data.room, [socket.id]);
        }

        //if room exists AND socket id is already added, ignore.
        else if (waitingLobby.get(data.room) && waitingLobby.get(data.room).indexOf(socket.id) > 0){
            return;
        }
        //if room exists AND socket id is not yet added, add socket id to room.
        else if (waitingLobby.get(data.room) && waitingLobby.get(data.room).indexOf(socket.id) < 0){
            waitingLobby.get(data.room).push(socket.id);
        }

        if (waitingLobby.get(data.room).length == 2){
            const randomVal = Math.random();
            const player1 = waitingLobby.get(data.room)[0];
            const player2 = waitingLobby.get(data.room)[1];
            if (randomVal >= 0.50){
                socket.in(data.room).emit("gameStart", player1)
            }
            else{
                socket.in(data.room).emit("gameStart", player2)
            }
            return;
        }

        socket.emit("receive_gameStart");
    });

    socket.on("sendTurn", (data) => {
        socket.in(data.room).emit("receiveTurn", data);
    });
})

server.listen(3001, () => {
    console.log("Server is running.");
})
