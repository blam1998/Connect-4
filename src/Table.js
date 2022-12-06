import './Table.css';
import {Component} from 'react';
import { socket } from './App';
import { useEffect, useState } from 'react';
import { isVisible } from '@testing-library/user-event/dist/utils';
const io = require('socket.io-client');


function Squares(props){
    const value = props.value;
    const chooseColor = (color) => {
        if (color === "X"){
            return "blue";
        }
        else if (color === "O"){
            return "red";
        }
        else if (color === null){
            return "white";
        }
    }

    return(
        <div className = "Square-Div">
            <svg className = "square" onClick = {props.handleClick} viewBox = "0 0 100 100">
                <circle className = "square-fill" fill = {chooseColor(props.value)} ></circle>
            </svg>
        </div>
    )
}

class Table extends Component{
    //table, myTurn, xIsNext, inProgress, winner => important!! must change every game.
    constructor(props){
        super(props);
        this.state = {
            table : Array.from(Array(6), () => new Array(7).fill(null)),
            myTurn: false,
            xIsNext: true,
            inProgress: false,
            myName: "",
            myId: "",
            myRoom: "",
            winner: "",
        };
        this.handleClick = this.handleClick.bind(this);
        this.renderSquare = this.renderSquare.bind(this);
        this.gameStartClick = this.gameStartClick.bind(this);
    }

    componentDidMount(){
        socket.on("receive_userName", (data) => {
            this.setState({
                myName : data.name,
                myId : data.id
            });
        });

        socket.on("receive_room", (data) => {
            this.setState({
                myRoom : data.room,
                winner: null,
                xIsNext: true,
                myTurn: false,
                table: Array.from(Array(6), () => new Array(7).fill(null)),
            })

            document.getElementById("Start-Sign").style.display = "block";
            document.getElementById("Start-Sign").innerHTML = "Start Game";
            document.getElementById("Win-Message").style.display = "none";
        });

        socket.on("receive_gameStart", () => {
            document.getElementById("Wait-Sign").style.display = "block";
        });

        socket.on("gameStart", (playerId) => {
            document.getElementById("Wait-Sign").style.display = "none";
            document.getElementById("Start-Sign").style.display = "none";

            //Chosen player gets to change their turn state.
            if (this.state.myId === playerId){
                this.setState({
                    myTurn: !this.state.myTurn,
                });
            }

            //changes everyone's game state.
            this.setState({
                inProgress: true
            });
        });

        socket.on("leave_oldRoom", (data) => {
            //To-do
            if (this.state.inProgress){
                alert(this.state.myName + " Wins!");
            }

            this.setState({
                inProgress: false,
            })

            document.getElementById("Start-Sign").innerHTML = "Start Game";

            if (document.getElementById("Wait-Sign").style.display === "block"){
                document.getElementById("Start-Sign").style.display = "none";
            }
        })

        socket.on("receiveTurn", (data) => {
            /*
            Data:
                Other Player: id, name.
                table,
                xIsNext,
                room,
                winner,
            */
           if (this.state.myId === data.id && data.winner === null){
                return;
           }

           if (data.winner !== null){
                document.getElementById("Win-Message").style.display = "block";
                document.getElementById("Start-Sign").innerHTML = "Play Again";
                document.getElementById("Start-Sign").style.display = "block";
           }

            this.setState({
                table : data.table,
                myTurn: !this.state.myTurn,
                xIsNext: data.xIsNext,
                winner: data.winner,
            });
        });
    }

    gameStartClick(){
        //table, myTurn, xIsNext, inProgress, winner => important!! must change every game.
        const id = this.state.myId;
        const room = this.state.myRoom;
        document.getElementById("Win-Message").style.display = "none";

        this.setState({
            myTurn: false,
            winner: "",
            table : Array.from(Array(6), () => new Array(7).fill(null)),
            xIsNext: true,
        })

        socket.emit("send_gameStart", {id, room});
    }
    
    handleClick(row,column){
        //If game has a winner, ignore click. OR game hasn't started. OR it's not my turn.
        if (this.state.winner || !this.state.myTurn){
            return;
        }
        //If tile is already taken, ignore click.
        if (this.state.table[row][column] != null){
            return;
        }

        //If tiles below is empty, put the tile at the lowest possible block.
        while (row + 1 < 6 && this.state.table[row + 1][column] === null){
            row++
        }

        const tempTable = this.state.table.slice();
        tempTable[row][column] = this.state.xIsNext? "X" : "O";
        

        this.setState({
            table: tempTable,
            xIsNext : !this.state.xIsNext,
            myTurn: false,
        });

        socket.emit("sendTurn", {
            table: this.state.table,
            xIsNext: !this.state.xIsNext,
            id: this.state.myId,
            name: this.state.myName,
            room: this.state.myRoom,
            winner: calculateWinner(tempTable, row, column)? this.state.myName : null,
        });

    }

    renderSquare(row, column){
        return(
            <Squares row = {row} column = {column} value = {this.state.table[row][column]} handleClick = {() => this.handleClick(row,column)} />
        )
    }

    render(){

        return(
            <div className = "Game-Table">
                <div id = "Start-Sign" onClick = {() => this.gameStartClick()}> Start </div>
                <div id = "Wait-Sign">Waiting for other player to ready up.</div>
                <div id = "Win-Message">{this.state.winner + " Wins!"}</div>
                <div id = "table">
                    {this.state.table.map((rElement, rIndex) => {
                        return(
                            <div className = "row">
                                {rElement.map((cElement,cIndex) =>{
                                    return(this.renderSquare(rIndex, cIndex));
                                })}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }
}


function calculateWinner(table, row, column){
    const rowLimit = 6;
    const colLimit = 7;
    const currChar = table[row][column];

    const directions = 
    [
    [[1,0], [-1,0]], //Up and down
    [[0,1], [0,-1]], //right and left
    [[1,1], [-1,-1]], //left diagonal
    [[-1,1], [1,-1]] //right diagonal
    ]
    

    for (let i = 0; i < directions.length; i++){
        for (let j = 0; j < directions[i].length; j++){
            var currRow = directions[i][j][0];
            var currCol = directions[i][j][1];
            var tempRow = row + currRow;
            var tempCol = column + currCol;
            var count = 1;

            while (tempRow < rowLimit && tempCol < colLimit && tempRow >= 0 && tempCol >= 0){
                if (table[tempRow][tempCol] === currChar){
                    count++
                }
                else{
                    break;
                }
                if (count === 4){
                    return currChar;
                }
                tempRow += currRow;
                tempCol += currCol;
            }
        }
    }
    return null;
}

export {Table as Table};