import './App.css';
import io from 'socket.io-client';
import React, { useEffect, useState } from 'react';
const socket = io.connect("http://localhost:3001");


let msgId = 0;

function App() {
  const [message, setMessage] = useState([""]);
  const [messageReceived, SetMessageReceived] = useState([]);
  const [currLobby, SetCurrLobby] = useState([]); //map {id : name}
  const [room, SetRoom] = useState("");
  const [userName, setUserName] = useState("?");
  const [userId, SetUserId] = useState("");

  const sendMessage = () => {
    socket.emit("send_message", {userName, message, room})
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      SetMessageReceived(messageReceived => [
        ...messageReceived,
        {name: data.userName, id: msgId++, message: data.message}
      ]);
    });

    socket.on("receive_userName", (data) => {
      setUserName(data.name);
      SetUserId(data.id);
    });

    socket.on("update_name", (data) => {
      //id, name
      //currLobby.set(data.id, data.name);
      const target = document.getElementById(data.id);
      target.innerHTML = data.name;
      
    });

    socket.on("receive_room", (data) => {
      SetRoom(room => data.room);

      SetMessageReceived(messageReceived => 
        [
          ...messageReceived,
          {name: "", id: msgId++, message: data.name + " has joined the room."}
      ]);

    });

    socket.on("room_info", (data) => {
      const id = data.id;
      const newMap = new Map([[id, data.name]])

      data.map((element,index) => {

        if (document.getElementById(element[0]) || !element){
          return;
        }

        var newName = document.createElement("div");
        var text = document.createTextNode(element[1]);
        newName.appendChild(text);
        newName.setAttribute("class", "Lobby-Name");
        newName.setAttribute("id", element[0]);
        document.getElementsByClassName("Lobby-Box")[0].appendChild(newName);

      });

    });

    socket.on("enter_name", () => {
      alert("Please pick a user name.");
    });

    socket.on("clear_chat", () => {
      SetMessageReceived(messageReceive => []);

      let parent = document.getElementsByClassName("Lobby-Box")[0];

      for (var i = 0; i < parent.children.length; i++){
        parent.removeChild(parent.children[i]);
      }

    });

    socket.on("leave_oldRoom", (data) => {
      //id, name
      let node = document.getElementById(data.id);
      if (node.parentNode){
        node.parentNode.removeChild(node);
      }

      SetMessageReceived(messageReceived => 
        [
          ...messageReceived,
          {name: "", id: msgId++, message: data.name + " has left the room."}
      ]);
      

    });

  }, [socket])

  return (
    <div className="App">
      <aside className = "Chat-Sidebar">
        <h1 className = "Chat-Title">Room {room}</h1>
        <div className = "Lobby-Box"> {}</div>
        <div className = "Chat-Box">
          <div>
            {messageReceived.map(element => (<span key = {element.id} id = {element.id} className = "Chat-Msg"> {element.name + (element.name? ": " : "") + element.message} </span>))}
          </div>
        </div> 
        <div className = "Chat-Query-Box">
          <input placeholder = "Message..." className = "Type-Msg" onChange = {(event) => {
            setMessage(event.target.value);
          }}></input>
          <button onClick = {sendMessage} className = "Msg-Button">Send</button>
        </div>
      </aside>
    </div>
  );
}

export {App as App, socket as socket};
