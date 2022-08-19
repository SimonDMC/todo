import TodoItem from './TodoItem';
import { TodoBoardObject, TodoItemType } from '../App';

interface TodoBoardProps {
    todos: TodoBoardObject;
    index: number;
    total: number;
    setTodos: Function;
    handleNameChange: Function;
    addBoard: Function;
    removeBoard: Function;
    moveBoard: Function;
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
        height: '2.6em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        position: 'absolute',
        bottom: '0',
    }

    const buttonStyle: React.CSSProperties = {
        background: 'none',
        fontSize: '1.5em',
        border: '0.1em solid transparent',
        color: '#777',
        cursor: 'pointer',
    }

    const setTodos = (todos: TodoItemType[]) => {
        props.setTodos(todos, props.todos.id);
    }

    // all of this is completely unmaintainable but idc im done with this project
    const fadeRemove = async () => {
        if (props.total === 1) return;
        let el = (document.querySelector(`.board-wrapper.${props.todos.id}`) as HTMLElement)
        el.style.opacity = '0';
        await new Promise(resolve => setTimeout(resolve, 300));
        props.removeBoard(props.index);
        await new Promise(resolve => setTimeout(resolve, 1));
        el.style.transitionProperty = 'none';
        el.style.opacity = '1';
        el.style.left = `calc(50% - 17.5em + ${(props.index + 1.5 - props.total / 2) * 37}em)`;
        if (props.total === 3) {
            let lastSibling = el.nextSibling as HTMLElement;
            if (lastSibling) {
                lastSibling.style.transitionProperty = 'none';
                lastSibling.style.opacity = '1';
                lastSibling.style.left = `calc(50% - 17.5em + ${(props.index + 2.5 - props.total / 2) * 37}em)`;
            }
        }
        await new Promise(resolve => setTimeout(resolve, 10));
        el.style.transitionProperty = 'opacity, left';
        el.style.left = `calc(50% - 17.5em + ${(props.index + 1 - props.total / 2) * 37}em)`;
        if (props.total === 3) {
            let lastSibling = el.nextSibling as HTMLElement;
            if (lastSibling) {
                lastSibling.style.transitionProperty = 'opacity, left';
                lastSibling.style.left = `calc(50% - 17.5em + ${(props.index + 2 - props.total / 2) * 37}em)`;
            }
        }
    }

    const moveLeft = async () => {
        if (props.index === 0) return;
        let el = (document.querySelector(`.board-wrapper.${props.todos.id}`) as HTMLElement);
        let sibling = el.previousSibling as HTMLElement;
        el.style.left = `calc(50% - 17.5em + ${(props.index - 0.5 - props.total / 2) * 37}em)`;
        sibling.style.left = `calc(50% - 17.5em + ${(props.index + 0.5 - props.total / 2) * 37}em)`;
        await new Promise(resolve => setTimeout(resolve, 300));
        props.moveBoard(props.index, props.index - 1);
        el.style.transitionProperty = 'none';
        el.style.left = `calc(50% - 17.5em + ${(props.index + 0.5 - props.total / 2) * 37}em)`;
        sibling.style.transitionProperty = 'none';
        sibling.style.left = `calc(50% - 17.5em + ${(props.index - 0.5 - props.total / 2) * 37}em)`;
        await new Promise(resolve => setTimeout(resolve, 1));
        el.style.transitionProperty = 'opacity, left';
        sibling.style.transitionProperty = 'opacity, left';
    }

    const moveRight = async () => {
        if (props.index === props.total - 1) return;
        let el = (document.querySelector(`.board-wrapper.${props.todos.id}`) as HTMLElement);
        let sibling = el.nextSibling as HTMLElement;
        el.style.left = `calc(50% - 17.5em + ${(props.index + 1.5 - props.total / 2) * 37}em)`;
        sibling.style.left = `calc(50% - 17.5em + ${(props.index + 0.5 - props.total / 2) * 37}em)`;
        await new Promise(resolve => setTimeout(resolve, 300));
        props.moveBoard(props.index, props.index + 1);
        el.style.transitionProperty = 'none';
        el.style.left = `calc(50% - 17.5em + ${(props.index + 0.5 - props.total / 2) * 37}em)`;
        sibling.style.transitionProperty = 'none';
        sibling.style.left = `calc(50% - 17.5em + ${(props.index + 1.5 - props.total / 2) * 37}em)`;
        await new Promise(resolve => setTimeout(resolve, 1));
        el.style.transitionProperty = 'opacity, left';
        sibling.style.transitionProperty = 'opacity, left';
    }

    const removeAnimation = async () => {
        // remove animation immediately
        if (props.todos.animation) {
            await new Promise(resolve => setTimeout(resolve, 10));
            setTodos(props.todos.todoItems);
        }
    }

    removeAnimation();

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
                <button style={buttonStyle} onClick={() => moveLeft()}><i className="fa-solid fa-arrow-left"></i></button>
                <button style={buttonStyle} onClick={() => moveRight()}><i className="fa-solid fa-arrow-right"></i></button>
                <button style={buttonStyle} onClick={() => props.addBoard(props.index + 1)}><i className="fa-solid fa-plus"></i></button>
                <button style={buttonStyle} onClick={() => fadeRemove()}><i className="fa-solid fa-minus"></i></button>
            </div>
        </ul>
    );
}

export default TodoBoard;