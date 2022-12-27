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
            p1Timer: 60,
            p2Timer: 60,
            timer: null,
            startTime: 0,
            elapsedTime: 0,
        }

        this.handleTurn = this.handleTurn.bind(this);
    }

    handleTurn(player){
        var elapsedTime = Date.now() - this.state.startTime;

        if (player === this.state.myId){
            document.getElementById("player2-timer").innerHTML = (this.state.p2Timer - elapsedTime/1000).toFixed(3) > 0? (this.state.p2Timer - elapsedTime/1000).toFixed(3) + " seconds" : 0;
            if (this.state.p2Timer <= elapsedTime/1000){
                clearInterval(this.state.timer)
            }
        }
        else{
            document.getElementById("player1-timer").innerHTML = (this.state.p2Timer - elapsedTime/1000).toFixed(3) > 0? (this.state.p2Timer - elapsedTime/1000).toFixed(3) + " seconds" : 0;
            if (this.state.p1Timer <= elapsedTime/1000){
                clearInterval(this.state.timer)
                socket.emit("timeOut", {id: this.state.myId})
            }
        }
        this.setState({elapsedTime : elapsedTime/1000})
        
    }

    componentDidMount(){
        socket.on("receive_userName", (data) => {
            this.setState(
                {
                    myId: data.id,
                    p1Name: data.name,
                    p1Timer: 60,
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

            clearInterval(this.state.timer);

            //data = [[socket1, player1]...]
            if (data.length === 1){
                this.setState({
                    p2Name: "",
                    p1Timer: 60,
                })
            }

            this.setState({
                p2Timer: 60,
                p1Timer: 60,
                elapsedTime: 0,
                startTime: 0,
                timer: null,
            })

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
            

            if (!this.state.myId){
                return;
            }
            if (this.state.myId === data.id){
                this.setState({p1Timer: this.state.p1Timer - this.state.elapsedTime})
                document.getElementById("player2").style.backgroundColor = "red";
                document.getElementById("player1").style.backgroundColor = "white";
           }
           else{
                this.setState({p2Timer: this.state.p2Timer - this.state.elapsedTime})
                document.getElementById("player1").style.backgroundColor = "red";
                document.getElementById("player2").style.backgroundColor = "white";
           }

           this.setState(
            {
                timer : setInterval(() => this.handleTurn(data.id), 100),
                startTime: Date.now(),
            })
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
                {p1Timer: 60,
                p2Timer: 60,
                elapsedTime: 0,
                startTime: 0,
            })
            document.getElementById("player2").style.backgroundColor = "white";
            document.getElementById("player1").style.backgroundColor = "white";
            if (this.state.myId === data){
                document.getElementById("player1").style.backgroundColor = "red";
            }
            if (this.state.myId !== data){
                document.getElementById("player2").style.backgroundColor = "red";
            }
        });

        socket.on("stopTimer", () => {
            clearInterval(this.state.timer);
        });

        socket.on("leave_oldRoom", () => {
            clearInterval(this.state.timer);
            this.setState({
                p1Timer: 60,
                p2Timer: 60,
                elapsedTime: 0,
                startTime: 0,
                p2Name: "",
            });
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