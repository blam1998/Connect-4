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

var myRooms = new Map(); //[[id1, id2]...]
var waitingLobby = new Map(); //[[id1, id2]...]
var nameMap = new Map(); //socket : id
var idRoomMap = new Map(); //id : room

io.on("connection", (socket) => {


    socket.on("send_message", (data) => {
        if (!data.userName){
            socket.emit("enter_name");
            return;
        }

        
        socket.in(data.room).emit("receive_message", data); //to everyone in room
        //socket.emit("receive_message", data); //to self
    });

    socket.on("disconnect", () => {
        const room = idRoomMap.get(socket.id);

        socket.in(room).emit("leave_oldRoom", {id: socket.id, name: nameMap.get(socket.id)});

        if (myRooms.get(room) && myRooms.get(room).indexOf(socket.id) >= 0){
            myRooms.get(room).splice(myRooms.get(room).indexOf(socket.id),1);
        }

        if (waitingLobby.get(room) && waitingLobby.get(room).indexOf(socket.id) >= 0){
            waitingLobby.get(room).splice(waitingLobby.get(room).indexOf(socket.id));
        }

        //Start deleting process
        nameMap.delete(socket.id);
        idRoomMap.delete(socket.id);
    });

    socket.on("send_room", (data) => {
        var oldRoom = socket.rooms.values()
        oldRoom = oldRoom.next();
        const room = data.room;
        const name = data.name;

        if (!data.name){
            socket.emit("enter_name");
            return;
        }

        //If room is full, return error message and don't join room.
        if(myRooms.get(room) && myRooms.get(room).length >= 2){
            socket.emit("room_full", {room});
            return;
        }

        idRoomMap.set(socket.id,room);

        //Leave old room before you join another room. each socket can be in 1 room at a time.
        if (myRooms.get(oldRoom.value) && myRooms.get(oldRoom.value).indexOf(socket.id) > -1){
            myRooms.get(oldRoom.value).splice(myRooms.get(oldRoom.value).indexOf(socket.id),1);
        }

        socket.leave(oldRoom.value);
        socket.in(oldRoom.value).emit("leave_oldRoom", {id: socket.id, name: nameMap.get(socket.id)});

        //Joining a new room by adding their socket ID to their room number.
        // If myRoom already exists but my socket id is not in there, and the room isn't full. add my socket ID to that room.
        if (myRooms.get(room) && myRooms.get(room).length < 2 && myRooms.get(room).indexOf(socket.id) == -1){
            myRooms.get(room).push(socket.id);
        }
        else{
            myRooms.set(room,[socket.id]);
        }



        const socket1 = myRooms.get(room)? myRooms.get(room)[0] : '';
        const player1 = nameMap.get(socket1)? nameMap.get(socket1) : '';
        const socket2 = myRooms.get(room)[1];
        const player2 = nameMap.get(socket2);


        var roomArray = null;

        if (socket1 && socket2){
            roomArray = [[socket1, player1], [socket2, player2]]
        }
        else{
            roomArray = [[socket1, player1]]
        }

        

        socket.join(room);
        socket.emit("clear_chat");
        socket.in(room).emit("room_info",  roomArray);
        socket.in(room).emit("receive_room", data);
    })

    socket.on("send_userName", (data) => {
        const id = socket.id;
        const name = data.userName;
        const room = idRoomMap.get(socket.id);

        nameMap.set(id, name);

        socket.emit("receive_userName", {name, id})
        socket.in(room).emit("update_name", {id: socket.id, name: data.userName})
    })



    socket.on("send_gameStart", (data) => {
        //data: id,room

        //if room doesn't exist, add room and socket id.
        if (!waitingLobby.get(data.room)){
            waitingLobby.set(data.room, [socket.id]);
        }

        //if room exists AND socket id is already added, ignore.
        else if (waitingLobby.get(data.room) && waitingLobby.get(data.room).indexOf(socket.id) >= 0){
            return;
        }
        //if room exists AND socket id is not yet added, add socket id to room.
        else if (waitingLobby.get(data.room) && waitingLobby.get(data.room).indexOf(socket.id) < 0){
            waitingLobby.get(data.room).push(socket.id);
            socket.in(data.room).emit("playerReady", {id: socket.id})
        }

        socket.emit("receive_gameStart");
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

            waitingLobby.get(data.room).length = 0;
        }

    });

    socket.on("sendTurn", (data) => {
        socket.in(data.room).emit("receiveTurn", data);
    });

    socket.on("update_nameSync", (data) => {
        //newName, id, room
        socket.in(data.room).emit("receive_update_nameSync", data);
    })
})

server.listen(3001, () => {
    console.log("Server is running.");
})
