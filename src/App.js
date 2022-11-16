import './App.css';
import io from 'socket.io-client';
import { useEffect, useState } from 'react';
const socket = io.connect("http://localhost:3001");


let msgId = 0;

function App() {
  const [message, setMessage] = useState([""]);
  const [messageReceived, SetMessageReceived] = useState([]);
  const [room, SetRoom] = useState("");

  const sendMessage = () => {
    socket.emit("send_message", {message, room})
  };

  const sendRoom = () => {
    socket.emit("send_room", {room})
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      SetMessageReceived(messageReceived => [
        ...messageReceived,
        {id: msgId++, message: data.message}
      ]);
    })

  }, [socket])


  return (
    <div className="App">
      <aside className = "Chat-Sidebar">
        <input placeholder = "Room id" onChange = {(event) => {
          SetRoom(event.target.value);}}>  
          </input>
        <button onClick = {sendRoom}>Join Room</button>
        <h1 className = "Chat-Title">Chat Room</h1>
        <div className = "Chat-Box">
          <ul>
            {messageReceived.map(element => (<span key = {element.id} id = {element.id} className = "Chat-Msg"> {element.message} </span>))}
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

export default App;
