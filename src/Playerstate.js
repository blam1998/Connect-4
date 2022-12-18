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
            p1Timer: "60s",
            p2Timer: "60s",
        }

        //this.handleTurn = this.handleTurn.bind(this);
    }

    componentDidMount(){
        socket.on("receive_userName", (data) => {
            this.setState(
                {
                    myId: data.id,
                    p1Name: data.name
            })
        });

        socket.on("receiveTurn", (data) => {
            if (this.state.myId === data.id){
                document.getElementById("player2").style.backgroundColor = "red";
                document.getElementById("player1").style.backgroundColor = "white";
           }
           else{
                document.getElementById("player1").style.backgroundColor = "red";
                document.getElementById("player2").style.backgroundColor = "white";
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
            document.getElementById("player2").style.backgroundColor = "white";
            document.getElementById("player1").style.backgroundColor = "white";
            if (this.state.myId && this.state.myId === data.id){
                document.getElementById("player1").style.backgroundColor = "red";
            }
            else if (this.state.myId && this.state.myId !== data.id){
                document.getElementById("player2").style.backgroundColor = "red";
            }
        })
    }

    handleTurn(){

    }
    

    render(){
        return(
            <div className = "Playerstate-Outer-Frame">
                {this.handleTurn()}
                <div id = "player1" className = "Playerstate">
                    <div>{this.state.p1Name? this.state.p1Name : ""}</div>
                    <div>{this.state.p1Timer}</div>
                </div>
                <div id = "player2" className = "Playerstate">
                    <div>{this.state.p2Name? this.state.p2Name : ""}</div>
                    <div>{this.state.p1Timer}</div>

                </div>
            </div>
            )
    }
}


export default Playerstate;