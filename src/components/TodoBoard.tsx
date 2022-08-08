import TodoItem from './TodoItem';
import { TodoBoardObject } from '../App';

interface TodoBoardProps {
    todos: TodoBoardObject;
    setTodos: Function;
    nextID: number;
    setNextID: Function;
    handleNameChange: Function;
}


const TodoBoard = (props: TodoBoardProps) => {

    const style: React.CSSProperties = {
        width: '40em',
        height: '70%',
        border: '7px solid #fff',
        borderRadius: '50px',
        backgroundColor: '#FDFFF2',
        listStyle: 'none',
        boxShadow: '0 0 15px #00000040',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        overflowY: 'auto',
        scrollBehavior: 'smooth',
    }

    const nameStyle: React.CSSProperties = {
        fontSize: '2.8em',
        fontWeight: '700',
        textAlign: 'center',
        backgroundColor: '#00000000',
        marginTop: '2.5%',
        color: '#00000080',
    }

    return (
            <ul
            className="todo-list"
            style={style}>
                <input 
                    type='text' 
                    placeholder='Board Name'
                    onChange={(e) => props.handleNameChange(e)}
                    style={nameStyle}
                    value={props.todos.name}>
                </input>
                {props.todos.todoItems.map((todo) => {
                    return (
                        <TodoItem
                        key={todo.id}
                        todo={todo}
                        todos={props.todos.todoItems}
                        setTodos={props.setTodos}
                        nextID={props.nextID}
                        setNextID={props.setNextID}
                        />
                    );
                })}
            </ul>
    );
}

export default TodoBoard;