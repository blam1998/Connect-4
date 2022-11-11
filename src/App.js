import './App.css';
import io from 'socket.io-client';
import { useEffect, useState } from 'react';
const socket = io.connect("http://localhost:3001");

function App() {
  const [message, setMessage] = useState("");
  const [messageReceived, SetMessageReceived] = useState("");
  const [room, SetRoom] = useState("");

  const sendMessage = () => {
    socket.emit("send_message", {message, room})
  };

  const sendRoom = () => {
    socket.emit("send_room", {room})
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      SetMessageReceived(data.message)
    })
  }, [socket])

  return (
    <div className="App">
      <input placeholder = "Room id" onChange = {(event) => {
        SetRoom(event.target.value);
      }}></input>

      <button onClick = {sendRoom}>Join Room</button>
      <input placeholder = "Message..." onChange = {(event) => {
        setMessage(event.target.value);
      }}></input>
      <button onClick = {sendMessage}>Send Message</button>
      <h1>Message: </h1> 
      {messageReceived}
    </div>
  );
}

export default App;
