import './Nav.css';
import io from 'socket.io-client';
import { useEffect, useState } from 'react';
import { socket } from './App';


function useCustomHook(){
    const [id, SetId] = useState("");
    const [player2, setPlayer2] = useState("");


    useEffect(() => {
        socket.on("receive_userName", (data) => {
            SetId(data.id);
        });

        socket.on("gameStart", (data) => {
            document.getElementsByClassName("Ready-Check")[0].style.display = "none";
        });

    }, [socket])

    useEffect(() => {
        socket.on("update_name", (data) => {
            //name, id
            if (id && id !== data.id){
                setPlayer2(player2 => data.name);
            }
        });

        socket.on("room_info", (data) => {
            //[[socket,name]...]

            data.map((element) => {
                if (id && element[0] !== id){
                    setPlayer2(player2 => element[1]);
                }
            })
        });

        socket.on("readyCheck", (data) => {
            //You're ready.
            const element = document.getElementsByClassName("Ready-Check")[0];
            const target = document.getElementsByClassName("Name")[0];
            document.getElementsByClassName("Ready-Check")[0].style.display = "block";
            if (id && data.id === id){
                target.before(element);
            }
            else{
                target.after(element);
            }
        });
    });


    return [id, player2];
}


function Nav(){
    var name = null;
    const [navId, player2] = useCustomHook();
    const [room, setRoomId] = useState("");
    const [userName, setUserName] = useState("");

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

        socket.on("leave_oldRoom", (data) => {
        });

        socket.on("receive_userName", (data) => {
            setUserName(userName => data.name);
        })


    }, [socket])

    return(
        <div className = "Navbar">
            <div className = "Navbar-NameDiv">
                <div className = "Ready-Check">{"[Ready]"}</div>
                <h1 className = "Name">{userName + (player2? ("  vs  " + player2) : "")} </h1>
            </div>
            <div className = "User-Info">
                <div className = "Name-Input">
                    <input placeholder = "Player Name..." id = "UserName"></input>
                    <button onClick = {() => {
                        name = document.getElementById("UserName").value;
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


