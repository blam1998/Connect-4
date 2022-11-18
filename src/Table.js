import './Table.css';
import {Component} from 'react';
import { socket } from './App';
import { useEffect, useState } from 'react';
const io = require('socket.io-client');


function Squares(props){
    return(
        <div className = "square" onClick = {props.handleClick}>
            {props.value}
        </div>
    )
}

class Table extends Component{
    constructor(props){
        super(props);
        this.state = {
            table : Array.from(Array(6), () => new Array(7).fill(null)),
            myTurn: false,
            myName: "",
            myId: "",
            hasWinner: false,
            gameStart: false,
            gameRoom: new Map()
        };
        this.handleClick = this.handleClick.bind(this);
        this.renderSquare = this.renderSquare.bind(this);
        this.gameStartClick = this.gameStartClick.bind(this);
    }

    componentDidMount(){
        socket.on("receive_userName",(data) => {
            var temp = new Map([this.state.gameRoom]? this.state.gameRoom : null);
            var temp2 = new Map();
            temp2.set(data.id, data.name);
            console.log(temp2);
            var finalMap = new Map([...temp].concat([...temp2]));
            this.setState(
            {
                gameRoom : finalMap,
                myName : data.name,
                myId: data.id,
            })
            console.log(finalMap);
        })
    }

    gameStartClick(){
        console.log(this.state.gameRoom.size);
        console.log("Hi");
        if (this.state.gameRoom.size < 2 || this.state.gameStart){
            return;
        }

        
        this.setState({gameStart : !this.state.gameStart})
    }
    
    handleClick(row,column){
        //If game has a winner, ignore click. OR game hasn't started.
        if (this.state.hasWinner || !this.state.gameStart){
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
        
        if (calculateWinner(tempTable, row, column)) {
            console.log( this.state.playerName + " Wins");
            this.setState({ hasWinner : !this.state.hasWinner});
        }

        this.setState({
            table: tempTable,
            xIsNext : !this.state.xIsNext
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
                <div className = "Start-Sign" onClick = {() => this.gameStartClick()}> Start </div>
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