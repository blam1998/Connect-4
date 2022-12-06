import './Playerstate.css';
import io from 'socket.io-client';
import { Component } from 'react';
import { socket } from './App';



class Playerstate extends Component{
    constructor(props){
        super(props);
        this.state = {
            myId: "",
            myName: "",
            p1Timer: "",
            p2Timer: "",
            p1Ready: false,
            p2Ready: false,
        }
    }

    componentDidMount(){

    }

    render(){
        return(
            <div className = "Playerstate-Outer-Frame">
                <div id = "player1" className = "Playerstate">

                </div>
                <div id = "player2" className = "Playerstate">

                </div>
            </div>
            )
    }
}