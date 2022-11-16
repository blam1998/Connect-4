import './Table.css';


let TableDimensions = Array.from(Array(6), () => new Array(1,2,3,4,5,6,7));

function GenerateTable(props){
    return(
        <table>
            <tbody>
            {props.TableDimensions.map((rElement, rIndex) => {
                return(<tr className = {"row" + (rIndex + 1).toString()} key = {rIndex.toString()}>
                    {rElement.map((cElement, cIndex) => {
                        return (<td className = {"column" + (cIndex + 1).toString()} key = {cIndex.toString()}></td>)
                    })}
                </tr>)
            })}
            </tbody>
        </table>
    )
}

function Table(props){
    return(
    <div className = "Table-Div">
        <GenerateTable TableDimensions = {TableDimensions} />
    </div>
    )
}

export {Table as Table};