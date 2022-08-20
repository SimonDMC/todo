import { TodoBoardObject } from "../App";
import TodoBoard from "./TodoBoard"
import { useState, useEffect } from "react";

interface TodoBoardListProps {
    todoBoards: TodoBoardObject[];
    setTodos: Function;
    handleNameChange: Function;
    addBoard: Function;
    removeBoard: Function;
    moveBoard: Function;
}

export default function TodoBoardList(props: TodoBoardListProps) {
    
    const [displayIndex, setDisplayIndex] = useState(0);
    
    // swiping - https://stackoverflow.com/a/56663695/19271522
    const swipeRight = () => {
        if (displayIndex < props.todoBoards.length - 1) setDisplayIndex(displayIndex + 1);
    }

    const swipeLeft = () => {
        if (displayIndex > 0) setDisplayIndex(displayIndex - 1);
    }

    let touchstartX = 0
    let touchendX = 0
    function checkDirection() {
        if (Math.abs(touchendX - touchstartX) < 20) return;
        if (touchendX < touchstartX) swipeRight();
        if (touchendX > touchstartX) swipeLeft();
    }
    const touchStart = (e: TouchEvent) => {
        touchstartX = e.changedTouches[0].screenX
    }
    const touchEnd = (e: TouchEvent) => {
        touchendX = e.changedTouches[0].screenX
        checkDirection()
    }
    useEffect(() => {
        document.addEventListener('touchstart', touchStart)
        document.addEventListener('touchend', touchEnd)
        return function cleanup() {
            document.removeEventListener('touchstart', touchStart)
            document.removeEventListener('touchend', touchEnd)
        }
    })

    const fontSize = Math.min(16, window.innerWidth * 0.024);
    const width = (props.todoBoards.length * 17.5 * 2 + (props.todoBoards.length - 1) * 2) * fontSize;

    const containerStyle: React.CSSProperties = {
        height: '100vh',
        width: width + 'px',
        position: 'relative',
        marginBottom: '3em',
        fontSize: 'min(1em, 2.4vw)',
        display: 'inline-block',
        marginLeft: window.innerWidth < width ? width - window.innerWidth + (5 - displayIndex * 73) * fontSize + 'px' : '0',
        transition: 'margin-left 0.3s ease-in-out',
    }

    return (
        <div style={containerStyle} className='board-container'>
            {props.todoBoards.map((todoBoard) => {

                let index = props.todoBoards.indexOf(todoBoard);
                let total = props.todoBoards.length;

                const boardStyle: React.CSSProperties = {
                    height: '100%',
                    width: 'fit-content',
                    top: '0em',
                    left: `calc(50% - 17.5em + ${(index + .5 - total / 2) * 37}em)`,
                    opacity: todoBoard.animation ? 0 : 1,
                    position: 'absolute',
                    transitionProperty: 'opacity, left',
                    transitionDuration: '0.3s',
                    transitionTimingFunction: 'ease-in-out',
                }

                return (
                    <div style={boardStyle} className={`board-wrapper ${todoBoard.id}`}>
                        <TodoBoard
                        key={todoBoard.id}
                        todos={todoBoard}
                        index={index}
                        total={total}
                        setTodos={props.setTodos}
                        handleNameChange={props.handleNameChange}
                        addBoard={props.addBoard}
                        removeBoard={props.removeBoard}
                        moveBoard={props.moveBoard}
                        />
                    </div>
                );
            })}
        </div>
    )
}
