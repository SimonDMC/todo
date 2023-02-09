import { useState, useEffect, useRef } from "react";
import "./App.css";
import Title from "./components/Title";
import TodoBoardList from "./components/TodoBoardList";
import Login from "./components/Login";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    User as FirebaseUser,
    onAuthStateChanged,
} from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { app, getUserData, saveUserData } from "./firebase";
import { isEqual } from "lodash";
import { getDataOverridePromise, randomString } from "./util";
import { Popup } from "./popup";
import CompletedButton from "./components/CompletedButton";

export type TodoItemType = {
    id: string;
    text: string;
    extraLines: number;
    animation?: boolean;
    completed?: boolean;
};

export type TodoBoardObject = {
    name: string;
    id: string;
    todoItems: TodoItemType[];
    animation?: boolean;
};

export type UserObject = {
    boards: TodoBoardObject[];
    completed: string[];
};

function App() {
    // activate service worker
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("./service-worker.ts");
        });
    }

    const importedTodos = localStorage.getItem("todo-list")
        ? (JSON.parse(
              localStorage.getItem("todo-list") as string
          ) as TodoBoardObject[])
        : ([
              {
                  name: "",
                  id: randomString(6),
                  todoItems: [
                      {
                          text: "",
                          id: randomString(6),
                      },
                  ],
              },
          ] as TodoBoardObject[]);

    importedTodos.forEach((board: TodoBoardObject) => {
        delete board.animation;
        board.todoItems.forEach((element: TodoItemType) => {
            delete element.animation;
        });
    });

    const [todos, setTodos] = useState(importedTodos);
    const completedItems = useRef(
        localStorage.getItem("TODO-completed-items") !== "undefined" &&
            localStorage.getItem("TODO-completed-items") != null
            ? (JSON.parse(
                  localStorage.getItem("TODO-completed-items") as string
              ) as string[])
            : []
    );
    if (completedItems.current == null) completedItems.current = [];

    const setTodosWrapper = (passedTodos: TodoItemType[], boardID: string) => {
        // clone boards by value
        let todoBoards = todos.slice();
        // find modified board
        let currentBoard = todoBoards.find((obj) => obj.id === boardID);
        if (currentBoard === undefined) return;
        // clone modified board by value and set new todo items
        let modifiedBoard = { ...currentBoard, todoItems: passedTodos };
        // remove animation
        delete modifiedBoard.animation;
        // find index of old board and replace it with new board
        let index = todoBoards.indexOf(currentBoard);
        todoBoards[index] = modifiedBoard;
        setTodos(todoBoards);
        localStorage.setItem("todo-list", JSON.stringify(todoBoards));
        if (user)
            saveUserData(
                user.uid,
                { board: modifiedBoard, boardIndex: index },
                completedItems.current
            );
    };

    const handleNameChange = (e: Event, boardID: string) => {
        // clone boards by value
        let todoBoards = todos.slice();
        // find modified board
        let currentBoard = todoBoards.find((obj) => obj.id === boardID);
        if (currentBoard === undefined) return;
        // clone modified board by value and set new name
        let modifiedBoard = {
            ...currentBoard,
            name: (e.target as HTMLInputElement).value,
        };
        // find index of old board and replace it with new board
        let index = todoBoards.indexOf(currentBoard);
        todoBoards[index] = modifiedBoard;
        setTodos(todoBoards);
        localStorage.setItem("todo-list", JSON.stringify(todoBoards));
        if (user)
            saveUserData(
                user.uid,
                { board: modifiedBoard, boardIndex: index },
                completedItems.current
            );
    };

    const addBoard = (index: number) => {
        if (todos.length >= 3) return;
        // clone boards by value
        let todoBoards = todos.slice();
        todoBoards.splice(index, 0, {
            name: "",
            id: randomString(6),
            animation: true,
            todoItems: [
                {
                    text: "",
                    id: randomString(6),
                    extraLines: 0,
                },
            ],
        });
        setTodos(todoBoards);
        localStorage.setItem("todo-list", JSON.stringify(todoBoards));
        if (user)
            saveUserData(
                user.uid,
                { allBoards: todoBoards },
                completedItems.current
            );
    };

    const removeBoard = (index: number) => {
        // clone boards by value
        let todoBoards = todos.slice();
        todoBoards.splice(index, 1);
        setTodos(todoBoards);
        localStorage.setItem("todo-list", JSON.stringify(todoBoards));
        if (user)
            saveUserData(
                user.uid,
                { allBoards: todoBoards },
                completedItems.current
            );
    };

    const moveBoard = (from: number, to: number) => {
        // clone boards by value
        let todoBoards = todos.slice();
        [todoBoards[from], todoBoards[to]] = [todoBoards[to], todoBoards[from]];
        setTodos(todoBoards);
        localStorage.setItem("todo-list", JSON.stringify(todoBoards));
        if (user)
            saveUserData(
                user.uid,
                { allBoards: todoBoards },
                completedItems.current
            );
    };

    const auth = getAuth(app);

    // get user if signed in
    const [user] = useAuthState(auth);

    useEffect(() => {
        onAuthStateChanged(auth, (signedInUser) => {
            if (signedInUser) {
                const loggedIn =
                    localStorage.getItem("TODO-signed-in") === "true";
                compareLocalAndUserData(signedInUser, !loggedIn);
                localStorage.setItem("TODO-signed-in", "true");
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth]);

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    };

    const logOut = () => {
        auth.signOut();
        localStorage.setItem("TODO-signed-in", "false");
    };

    const compareLocalAndUserData = async (
        firebaseUser: FirebaseUser,
        newLogin: boolean
    ) => {
        /*
      Order of operations:
        1 - If local data matches user data, leave it as is.
        2 - If user data is empty, save local data to it.
        3 - If local data is empty, set user data to it.
        4 - If user data and local data both exist and are different:
          4.1 - If the user has just logged in, open prompt to overwrite local data.
          4.2 - If the user is already logged in, set local data to user data.
    */
        let userData = (await getUserData(firebaseUser.uid)) as UserObject;
        let todoBoards = localStorage.getItem("todo-list")
            ? (JSON.parse(
                  localStorage.getItem("todo-list") as string
              ) as TodoBoardObject[])
            : ([
                  {
                      name: "",
                      id: randomString(6),
                      todoItems: [
                          {
                              text: "",
                              id: randomString(6),
                          },
                      ],
                  },
              ] as TodoBoardObject[]);
        // remove animation attributes for comparison
        if (userData && Object.keys(userData).length !== 0) {
            // non-empty user data check
            userData.boards.forEach((board: TodoBoardObject) => {
                delete board.animation;
                board.todoItems.forEach((element: TodoItemType) => {
                    delete element.animation;
                });
            });
        }

        // 1
        if (isEqual(userData.boards, todoBoards)) {
            console.log("Local data matches user data.");
            // 2
        } else if (!userData || Object.keys(userData).length === 0) {
            // empty
            console.log("User data is empty.");
            saveUserData(
                firebaseUser.uid,
                { allBoards: todoBoards },
                completedItems.current
            );
            // 3
        } else if (
            todoBoards.length === 1 &&
            todoBoards[0].todoItems.length === 1
        ) {
            // empty apart from placeholder item
            console.log("Local data is empty.");
            setTodos(userData.boards);
            completedItems.current = userData.completed;
            localStorage.setItem("todo-list", JSON.stringify(userData.boards));
            localStorage.setItem(
                "TODO-completed-items",
                JSON.stringify(userData.completed)
            );
            // 4
        } else {
            console.log("User data and local data are different.");
            // 4.1
            if (newLogin) {
                let oldOverridePopup =
                    document.querySelector(".popup.override");
                if (oldOverridePopup) oldOverridePopup.remove();
                const overridePopup = new Popup({
                    id: "override",
                    title: "Data Conflict",
                    content: `Your cloud data and local data are different. Which one do you want to use?
            custom-space-out big-margin§{btn-refuse-override}[Local Data]{btn-accept-override}[Cloud Data]`,
                    sideMargin: "1.5em",
                    fontSizeMultiplier: "1.2",
                    dynamicHeight: true,
                    backgroundColor: "#FFFEE3",
                    allowClose: false,
                });
                overridePopup.show();
                await getDataOverridePromise()
                    .then(() => {
                        // accepted local override
                        setTodos(userData.boards);
                        completedItems.current = userData.completed;
                        localStorage.setItem(
                            "todo-list",
                            JSON.stringify(userData.boards)
                        );
                        localStorage.setItem(
                            "TODO-completed-items",
                            JSON.stringify(userData.completed)
                        );
                        overridePopup.hide();
                    })
                    .catch(() => {
                        // rejected local override (local overrides cloud)
                        saveUserData(
                            firebaseUser.uid,
                            { allBoards: todoBoards },
                            completedItems.current
                        );
                        overridePopup.hide();
                    });
                // 4.2
            } else {
                setTodos(userData.boards);
                completedItems.current = userData.completed;
                localStorage.setItem(
                    "todo-list",
                    JSON.stringify(userData.boards)
                );
                localStorage.setItem(
                    "TODO-completed-items",
                    JSON.stringify(userData.completed)
                );
            }
        }
    };

    let oldCompletedPopup = document.querySelector(".popup.completed");
    if (oldCompletedPopup) oldCompletedPopup.remove();
    let completedPopupContent = "<ul>";
    if (completedItems.current && completedItems.current.length > 0) {
        for (const element of completedItems.current) {
            completedPopupContent += `<li><span>${element}</span><button><i class="fa-solid fa-xmark"></i></button></li>`;
        }
    }
    completedPopupContent += `</ul>`;
    if (completedPopupContent === "<ul></ul>")
        completedPopupContent = "<h2>Nothing here yet!</h2>";

    let completedPopup = new Popup({
        id: "completed",
        title: "Completed Items",
        backgroundColor: "#FFFEE3",
        titleColor: "#000000A0",
        closeColor: "#000000A0",
        content: completedPopupContent,
    });

    // add a click event listener to all buttons in the completed popup
    for (const button of document.querySelectorAll(".popup.completed button")) {
        button.addEventListener("click", async (event) => {
            const deleteButton = event.target as HTMLButtonElement;
            const li = deleteButton.parentElement
                ?.parentElement as HTMLLIElement;
            const span = li.firstElementChild as HTMLSpanElement;
            const text = span.innerText;
            const parent = li.parentElement;
            completedItems.current = completedItems.current.filter(
                (element) => element !== text
            );
            localStorage.setItem(
                "TODO-completed-items",
                JSON.stringify(completedItems.current)
            );
            li.style.opacity = "0";
            // wait .3s
            await new Promise((resolve) => setTimeout(resolve, 300));
            li.remove();
            if (parent?.childElementCount === 0)
                document.querySelector(
                    ".popup.completed .popup-body"
                )!.innerHTML = "<h2>Nothing here yet!</h2>";
        });
    }

    return (
        <div className="App">
            <Login
                loggedIn={user !== null}
                loginWithGoogle={loginWithGoogle}
                logOut={logOut}
            />
            <TodoBoardList
                todoBoards={todos}
                setTodos={setTodosWrapper}
                completedItems={completedItems.current}
                handleNameChange={handleNameChange}
                addBoard={addBoard}
                removeBoard={removeBoard}
                moveBoard={moveBoard}
            />
            <Title title="To Do:" />
            <CompletedButton onClick={() => completedPopup.show()} />
        </div>
    );
}

export default App;
