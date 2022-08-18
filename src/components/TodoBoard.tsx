import TodoItem from './TodoItem';
import { TodoBoardObject, TodoItemType } from '../App';

interface TodoBoardProps {
    todos: TodoBoardObject;
    setTodos: Function;
    handleNameChange: Function;
}


const TodoBoard = (props: TodoBoardProps) => {

    const style: React.CSSProperties = {
        width: '35em',
        height: '100%',
        border: '0.4em solid #fff',
        borderRadius: '3em',
        backgroundColor: '#FDFFF2',
        listStyle: 'none',
        boxShadow: '0 0 1em #00000040',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflowX: 'hidden',
        position: 'relative',
    }

    const nameStyle: React.CSSProperties = {
        fontSize: '2.8em',
        fontWeight: '700',
        textAlign: 'center',
        backgroundColor: '#00000000',
        marginTop: '2.5%',
        color: '#00000080',
        width: '100%',
    }

    const wrapperStyle: React.CSSProperties = {
        marginBottom: '3em',
        borderBottom: '0.02em solid #81818180',
        width: '100%',
        height: '100%',
        position: 'relative',
        overflowY: 'auto',
        scrollBehavior: 'smooth',
        backgroundClip: 'padding-box',
    }

    const bottomBarStyle: React.CSSProperties = {
        width: '100%',
        height: 'calc((3em - 0.4em) / 1.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        position: 'absolute',
        bottom: '0',
        fontSize: '1.5em',
        color: '#777',
    }

    const setTodos = (todos: TodoItemType[]) => {
        props.setTodos(todos, props.todos.id);
    }

    return (
        <ul
        className="todo-list"
        style={style}>
            <div className='list-wrapper' style={wrapperStyle}>
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
            </div>
            <div className='bottom-bar' style={bottomBarStyle}>
                <i className="fa-solid fa-arrow-left"></i>
                <i className="fa-solid fa-arrow-right"></i>
                <i className="fa-solid fa-plus"></i>
                <i className="fa-solid fa-minus"></i>
            </div>
        </ul>
    );
}

export default TodoBoard;