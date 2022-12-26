import './Playerstate.css';
import io from 'socket.io-client';
import { Component } from 'react';
import { socket } from './App';



class Playerstate extends Component{
    constructor(props){
        super(props);
        this.state = {
            myId: "",
            p1Name: "",
            p2Name: "",
            p1Timer: 10000,
            p2Timer: 10000,
            timer: null,
        }

        this.handleTurn = this.handleTurn.bind(this);
    }

    handleTurn(player){
        if (player === this.state.myId){
            document.getElementById("player2-timer").innerHTML = (this.state.p2Timer/1000).toString() + " seconds";
            this.setState({p2Timer : this.state.p2Timer - 1})
            if (this.state.p2Timer === 1){
                clearInterval(this.state.timer)
            }
        }
        else{
            document.getElementById("player1-timer").innerHTML = (this.state.p1Timer/1000).toString() + " seconds";
            this.setState({p1Timer : this.state.p1Timer - 1})
            if (this.state.p1Timer === 1){
                clearInterval(this.state.timer)
                socket.emit("timeOut", {id: this.state.myId})
            }
        }
        
    }

    componentDidMount(){
        socket.on("receive_userName", (data) => {
            this.setState(
                {
                    myId: data.id,
                    p1Name: data.name
            })
        });

        socket.on("playerID", (data) => {
            //data = name, id, room
            this.setState({
                myId: data.id,
                p1Name: data.name
            })
        });

        socket.on("room_info", (data) => {
            //data = [[socket1, player1]...]
            data.map((element) => {
                if (this.state.myId && element[0] !== this.state.myId){
                    this.setState({
                        p2Name: element[1],
                    })
                }
            })
        })

        socket.on("receiveTurn", (data) => {
            clearInterval(this.state.timer);
            this.setState({timer : null});

            if (!this.state.myId){
                return;
            }
            if (this.state.myId === data.id){
                document.getElementById("player2").style.backgroundColor = "red";
                document.getElementById("player1").style.backgroundColor = "white";
                this.setState({timer : setInterval(() => this.handleTurn(data.id), 1000)})
           }
           else{
                document.getElementById("player1").style.backgroundColor = "red";
                document.getElementById("player2").style.backgroundColor = "white";
                this.setState({timer : setInterval(() => this.handleTurn(data.id), 1000)})
           }
        });

        socket.on("update_name", (data) => {
            if (this.state.myId && this.state.myId !== data.id){
                this.setState({p2Name: data.name});
            }
            else{
                this.setState({p1Name: data.name});
            }
        })

        socket.on("readyCheck", (data) => {
            if (this.state.myId && this.state.myId === data.id){
                document.getElementById("player1").style.backgroundColor = "blue";
            }
            else{
                document.getElementById("player2").style.backgroundColor = "blue";
            }
        })

        socket.on("gameStart", (data) => {
            //First turn ID.

            this.setState(
                {p1Timer: 10,
                p2Timer: 10})
            document.getElementById("player2").style.backgroundColor = "white";
            document.getElementById("player1").style.backgroundColor = "white";
            if (this.state.myId === data){
                document.getElementById("player1").style.backgroundColor = "red";
            }
            if (this.state.myId !== data){
                document.getElementById("player2").style.backgroundColor = "red";
            }
        })
    }
    

    render(){
        return(
            <div className = "Playerstate-Outer-Frame">
                <div id = "player1" className = "Playerstate">
                    <div>{this.state.p1Name? this.state.p1Name : ""}</div>
                    <div id = "player1-timer">{this.state.p1Name? this.state.p1Timer  + " seconds": ""}</div>
                </div>
                <div id = "player2" className = "Playerstate">
                    <div>{this.state.p2Name? this.state.p2Name : ""}</div>
                    <div id = "player2-timer">{this.state.p2Name? this.state.p2Timer + " seconds" : ""}</div>

                </div>
            </div>
            )
    }
}


export default Playerstate;