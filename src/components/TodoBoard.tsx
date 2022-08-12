import TodoItem from './TodoItem';
import { TodoBoardObject, TodoItemType } from '../App';

interface TodoBoardProps {
    todos: TodoBoardObject;
    setTodos: Function;
    handleNameChange: Function;
}


const TodoBoard = (props: TodoBoardProps) => {

    const style: React.CSSProperties = {
        width: '40em',
        height: '100%',
        border: '7px solid #fff',
        borderRadius: '3em',
        backgroundColor: '#FDFFF2',
        listStyle: 'none',
        boxShadow: '0 0 1em #00000040',
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

    const setTodos = (todos: TodoItemType[]) => {
        props.setTodos(todos, props.todos.id);
    }

    return (
            <ul
            className="todo-list"
            style={style}>
                <input 
                    type='text' 
                    placeholder='Board Name'
                    onChange={(e) => props.handleNameChange(e, props.todos.id)}
                    style={nameStyle}
                    value={props.todos.name}>
                </input>
                {props.todos.todoItems.map((todo) => {
                    return (
                        <TodoItem
                        key={todo.id}
                        todo={todo}
                        todos={props.todos.todoItems}
                        setTodos={setTodos}
                        />
                    );
                })}
            </ul>
    );
}

export default TodoBoard;