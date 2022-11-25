import './App.css';
import io from 'socket.io-client';
import { useEffect, useState } from 'react';
const socket = io.connect("http://localhost:3001");


let msgId = 0;

function App() {
  const [message, setMessage] = useState([""]);
  const [messageReceived, SetMessageReceived] = useState([]);
  const [currLobby, SetCurrLobby] = useState([]);
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
      if (data.id !== userId){
        return;
      }



    });

    socket.on("receive_room", (data) => {
      SetRoom(data.room);

    });

    socket.on("room_info", (data) => {
      SetCurrLobby(
        currLobby => data.roomInfo,
      )
    });

    socket.on("enter_name", () => {
      alert("Please pick a user name.");
    });

    socket.on("clear_chat", () => {
      SetMessageReceived(messageReceive => []);
    });

  }, [socket])

  useEffect(() => {
    const last = currLobby[currLobby.length - 1];
    SetMessageReceived(messageReceived => 
      [
        ...messageReceived,
        {name: "", id: msgId++, message: last + " has joined the room."}
    ]);
  }, [currLobby]);

  return (
    <div className="App">
      <aside className = "Chat-Sidebar">
        <h1 className = "Chat-Title">Room {room}</h1>
        <div className = "Lobby-Box"> {currLobby.map((element,index) => (<div id = {"lobby" + index} className = "Lobby-Name">{element}</div>))}</div>
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
