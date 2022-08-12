import { TodoBoardObject } from "../App";
import TodoBoard from "./TodoBoard"

interface TodoBoardListProps {
    todoBoards: TodoBoardObject[];
    setTodos: Function;
    handleNameChange: Function;
}

export default function TodoBoardList(props: TodoBoardListProps) {

    const containerStyle: React.CSSProperties = {
        height: '100vh',
        width: '100vw',
        position: 'relative',
        marginBottom: '3em',
        fontSize: 'min(1em, 2.4vw)',
    }

    return (
        <div style={containerStyle} className='board-container'>
            {props.todoBoards.map((todoBoard) => {

                let index = props.todoBoards.indexOf(todoBoard) + .5;
                let total = props.todoBoards.length;

                const boardStyle: React.CSSProperties = {
                    height: '100%',
                    width: 'fit-content',
                    top: '0em',
                    left: `calc(50% - 17.5em + ${(index - total / 2) * 37}em)`,
                    position: 'absolute',
                }

                return (
                    <div style={boardStyle} className='board-wrapper'>
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
