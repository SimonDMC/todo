import { TodoBoardObject } from "../App";
import TodoBoard from "./TodoBoard"

interface TodoBoardListProps {
    todoBoards: TodoBoardObject[];
    setTodos: Function;
    handleNameChange: Function;
}

export default function TodoBoardList(props: TodoBoardListProps) {

    const boardStyle: React.CSSProperties = {
        height: '100%',
    }

    const containerStyle: React.CSSProperties = {
        height: '40.7em',
        position: 'relative',
        marginBottom: '3em',
        fontSize: 'min(1em, 2.2vw)',
    }

    return (
        <div style={containerStyle}>
            {props.todoBoards.map((todoBoard) => {
                return (
                    <div style={boardStyle}>
                        <TodoBoard
                        key={todoBoard.id}
                        todos={todoBoard}
                        setTodos={props.setTodos}
                        handleNameChange={props.handleNameChange}
                        />
                    </div>
                );
            })}
        </div>
    )
}
