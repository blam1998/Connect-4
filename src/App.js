import './App.css';
import io from 'socket.io-client';
import { useEffect, useState } from 'react';
const socket = io.connect("http://localhost:3001");


let msgId = 0;

function App() {
  const [message, setMessage] = useState([""]);
  const [messageReceived, SetMessageReceived] = useState([]);
  const [room, SetRoom] = useState("");
  const [userName, setUserName] = useState("?");

  const sendMessage = () => {
    var name = userName;
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
      console.log(userName);
    });

    socket.on("receive_room", (data) => {
      SetRoom(data.room);
    });

    socket.on("enter_name", () => {
      alert("Please pick a user name.");
    });

  }, [socket])


  return (
    <div className="App">
      <aside className = "Chat-Sidebar">
        <h1 className = "Chat-Title">Room {room}</h1>
        <div className = "Chat-Box">
          <ul>
            {messageReceived.map(element => (<span key = {element.id} id = {element.id} className = "Chat-Msg"> {element.name + ": " + element.message} </span>))}
          </ul>
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
