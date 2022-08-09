import ContentEditable, { ContentEditableEvent } from 'react-contenteditable'
import { placeCaretAtEnd, getInnerHeight, randomString } from '../util';
import { TodoItemType } from '../App';

interface TodoItemProps {
    todo: TodoItemType;
    todos: TodoItemType[];
    setTodos: Function;
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
        border: '0.07em solid #81818180',
        borderRadius: '0.8em',
        top: 2.6 + index * 2.5 + prevExtraLines * 1.22 + 'em',
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
        wordBreak: 'break-word',
        animation: props.todo.animation ? 'fade-in .3s' : 'none',
    }

    const circlestyle: React.CSSProperties = {
        border: '0.07em solid #81818180',
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

    const handleChange = async (evt: ContentEditableEvent) => {
        let oldValue = props.todo.text;
        let newValue = (evt.target as HTMLTextAreaElement).value;
        let toSave;
        // if deleting a todo, remove it
        if (oldValue !== '' && newValue === '') {
            let baseElement = (document.querySelector(".todo-item.item-" + props.todo.id) as HTMLElement);
            // let fade out
            baseElement.style.opacity = '0';

            // if previous element exists, select it, otherwise select next element
            let el = baseElement.previousElementSibling?.firstChild;
            if (!el) el = baseElement.nextElementSibling?.firstChild;
            placeCaretAtEnd(el as HTMLInputElement);

            await new Promise(r => setTimeout(r, 300))

            toSave = props.todos.filter(todo => todo.id !== props.todo.id);
        }
        else {
            // if filling in an empty todo, create a new empty one
            if (oldValue === '' && newValue !== '') {
                props.todos.push({
                    id: randomString(4),
                    text: '',
                    extraLines: 0,
                    animation: true,
                });
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

    const handleKeyDown = (evt: React.KeyboardEvent) => {
        let baseElement = (document.querySelector(".todo-item.item-" + props.todo.id) as HTMLElement);
        
        if (evt.key === 'Enter' || evt.key === 'ArrowDown') {
            // cancel event
            evt.preventDefault();
            evt.stopPropagation();
            
            // if next element exists, select it
            let el = baseElement.nextElementSibling?.firstChild;
            if (el) placeCaretAtEnd(el as HTMLInputElement);
            
        }
        if (evt.key === 'ArrowUp') {
            evt.preventDefault();
            evt.stopPropagation();

            // if previous element exists, select it
            let el = baseElement.previousElementSibling?.firstChild;
            if (el) placeCaretAtEnd(el as HTMLInputElement);
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

    const handleTextBoxClick = (evt: React.MouseEvent) => {
        if ((evt.target as HTMLElement).tagName === 'LI') {
            placeCaretAtEnd(document.querySelector(".todo-item.item-" + props.todo.id + " .todo-text") as HTMLInputElement);
        }
    }

    const audio = new Audio(ding);

    return (
            <li
            className={"todo-item item-" + props.todo.id}
            style={style}
            onClick={(e) => handleTextBoxClick(e)}>
                <ContentEditable
                    className="todo-text"
                    html={props.todo.text}
                    onChange={(e) => handleChange(e)}
                    onKeyDown={(e) => handleKeyDown(e)}
                    data-gramm="false"
                    data-gramm_editor="false"
                    data-enable-grammarly="false"
                />
                <div 
                className="todo-circle"
                style={circlestyle}
                onClick={() => handleCheckboxClick()}>
                <i className="fa-solid fa-check"></i>
                </div>
            </li>
    );
}

export default TodoItem;