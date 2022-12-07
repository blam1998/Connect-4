import './Playerstate.css';
import io from 'socket.io-client';
import { Component } from 'react';
import { socket } from './App';



class Playerstate extends Component{
    constructor(props){
        super(props);
        this.state = {
            myId: "",
            p1Name: "Erbs",
            p2Name: "",
            p1Timer: "60s",
            p2Timer: "60s",
            p1Ready: false,
            p2Ready: false,
        }

        this.handleTurn = this.handleTurn.bind(this);
    }

    componentDidMount(){

    }

    handleTurn(){
        return(<div>hi</div>);
    }

    render(){
        return(
            <div className = "Playerstate-Outer-Frame">
                <div id = "player1" className = "Playerstate">
                    <div>{this.state.p1Name? this.state.p1Name : ""}</div>
                    <div>{this.state.p1Timer}</div>
                    <div>{() => this.handleTurn()}</div>
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