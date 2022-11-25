import './Nav.css';
import io from 'socket.io-client';
import { useEffect, useState } from 'react';
import { socket } from './App';


function Nav(){
    const [userName, setUserName] = useState("");
    const [room, setRoomId] = useState("");


    const sendRoom = () => {
        socket.emit("send_room", {name: userName, room});
    }

    useEffect(() => {
        socket.emit("send_userName", {userName});
    },[userName])

    useEffect(() => {
        socket.on("room_full", (data) => {
            alert("Room " + data.room + " is full.");
        });

        socket.on("receive_room", (data) => {
            setRoomId(data.room);
          });

    }, [socket])

    return(
        <div className = "Navbar">
            <h1 className = "Navbar-Name">{userName}</h1>
            <div className = "User-Info">
                <div className = "Name-Input">
                    <input placeholder = "Player Name..." id = "UserName"></input>
                    <button onClick = {() => {
                        let name = document.getElementById("UserName").value;
                        setUserName(name);
                        }}>Send</button>
                </div>
                <div className = "Room-Input">
                    <input placeholder = "Room ID..." onChange = {(event) => {setRoomId(event.target.value);}}></input>
                    <button onClick = {sendRoom}>Send</button>
                </div>
            </div>
        </div>
    )
}

export {Nav as Nav};


