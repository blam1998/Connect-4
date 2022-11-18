import './Table.css';
import {Component} from 'react';



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
            xIsNext : true,
            hasWinner: false,
        };
        this.handleClick = this.handleClick.bind(this);
        this.renderSquare = this.renderSquare.bind(this);
    }

    handleClick(row,column){
        //If tile is already taken, ignore click.
        if (this.state.hasWinner){
            return;
        }

        if (this.state.table[row][column] != null){
            return;
        }
        if (row + 1 < 6 && this.state.table[row + 1][column] === null){
            return;
        }

        const tempTable = this.state.table.slice();
        tempTable[row][column] = this.state.xIsNext? "X" : "O";
        
        if (calculateWinner(tempTable, row, column)) {
            console.log(calculateWinner(tempTable, row, column) + " Wins");
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