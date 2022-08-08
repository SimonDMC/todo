import ContentEditable from 'react-contenteditable'
import { placeCaretAtEnd, getInnerHeight } from '../util';
import { TodoItemType } from '../App';

interface TodoItemProps {
    todo: TodoItemType;
    todos: TodoItemType[];
    setTodos: Function;
    nextID: number;
    setNextID: Function;
}

const TodoItem = (props: TodoItemProps) => {

    const index = props.todos.indexOf(props.todo);
    const ding = require("../ding.mp3");

    let prevExtraLines = 0;

    props.todos.slice(0, index).forEach((todo) => {
        prevExtraLines += todo.extraLines;
    });

    const style: React.CSSProperties = {
        color: '#818181B0',
        fontWeight: '500',
        fontSize: '2em',
        border: '2px solid #81818180',
        borderRadius: '25px',
        top: 13 + index * 12.5 + prevExtraLines * 6.1 + '%',
        marginLeft: '3%',
        marginRight: '3%',
        padding: '2% 3%',
        display: 'flex',
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'opacity 0.3s, top 0.5s',
        width: '94%',
        cursor: 'text',
        animation: props.todo.animation ? 'fade-in .3s' : 'none',
    }

    const circlestyle: React.CSSProperties = {
        border: '2px solid #81818180',
        borderRadius: '100%',
        width: '1.2em',
        height: '1.2em',
        flexShrink: 0,
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textSizeAdjust: 'none',
        color: '#81818100',
        transition: 'color 0.3s',
    }

    const handleChange = async (evt: Event) => {
        let oldValue = props.todo.text;
        let newValue = (evt.target as HTMLTextAreaElement).value;
        let toSave;
        // if deleting a todo, remove it
        if (oldValue !== '' && newValue === '') {
            // let fade out
            (document.querySelector(".todo-item.item-" + props.todo.id) as HTMLElement).style.opacity = '0';

            // if not first element, select previous element
            let el = document.querySelector(".todo-item.item-" + (props.todo.id - 1) + " .todo-text");
            // if first element, select next element
            if (!el) {
                el = document.querySelector(".todo-item.item-" + (props.todo.id + 1) + " .todo-text");
            }
            placeCaretAtEnd(el as HTMLInputElement);

            await new Promise(r => setTimeout(r, 300))

            toSave = props.todos.filter(todo => todo.id !== props.todo.id);
        }
        else {
            // if filling in an empty todo, create a new empty one
            if (oldValue === '' && newValue !== '') {
                props.todos.push({
                    id: props.nextID,
                    text: '',
                    extraLines: 0,
                });
                // update nextID
                props.setNextID(props.nextID + 1)
            }

            // calculate amount of extra lines
            let thisBox = document.querySelector(".todo-item.item-" + props.todo.id + " .todo-text") as HTMLElement;
            let emptyBox = document.querySelector(".todo-list li:last-child .todo-text") as HTMLElement;
            let extraLines = getInnerHeight(thisBox) / getInnerHeight(emptyBox) - 1;

            // if editing a todo, update it
            toSave = props.todos.map(todo => {
                if (todo.id === props.todo.id) {
                    return {
                        ...todo,
                        text: newValue,
                        extraLines: extraLines
                    }
                }
                return todo
            })
        }

        // save everything
        props.setTodos(toSave);
    };

    const handleKeyDown = (evt: KeyboardEvent) => {
        if (evt.key === 'Enter' || evt.key === 'ArrowDown') {
            // cancel event
            evt.preventDefault();
            evt.stopPropagation();

            // if not last element, select next element
            let el = document.querySelector(".todo-item.item-" + (props.todo.id + 1) + " .todo-text");
            if (el) {
                placeCaretAtEnd(el as HTMLInputElement);
            }
        }
        if (evt.key === 'ArrowUp') {
            evt.preventDefault();
            evt.stopPropagation();

            // if not first element, select previous element
            let el = document.querySelector(".todo-item.item-" + (props.todo.id - 1) + " .todo-text");
            if (el) {
                placeCaretAtEnd(el as HTMLInputElement);
            }
        }
    }

    const handleCheckboxClick = async () => {
        // check for not empty todo
        if (props.todo.text === '') return;

        // play sound
        audio.play();

        // fade in checkmark
        (document.querySelector(".todo-item.item-" + props.todo.id + " .todo-circle") as HTMLElement).style.color = '#81818180';

        await new Promise(r => setTimeout(r, 300));

        // fade out box
        (document.querySelector(".todo-item.item-" + props.todo.id) as HTMLElement).style.opacity = '0';

        await new Promise(r => setTimeout(r, 300));

        // remove todo object from todos array
        props.setTodos(props.todos.filter((todo) => {
            return todo.id !== props.todo.id;
        }));
    }

    const handleTextBoxClick = (evt: Event) => {
        if ((evt.target as HTMLTextAreaElement).tagName === 'LI') {
            placeCaretAtEnd(document.querySelector(".todo-item.item-" + props.todo.id + " .todo-text") as HTMLInputElement);
        }
    }

    const audio = new Audio(ding);

    return (
            <li
            className={"todo-item item-" + props.todo.id}
            style={style}
            onClick={() => handleTextBoxClick}>
                <ContentEditable
                    className="todo-text"
                    html={props.todo.text}
                    onChange={() => handleChange}
                    onKeyDown={() => handleKeyDown}
                />
                <div 
                className="todo-circle"
                style={circlestyle}
                onClick={handleCheckboxClick}>
                <i className="fa-solid fa-check"></i>
                </div>
            </li>
    );
}

export default TodoItem;