import { useState, useEffect } from 'react';
import './App.css';
import Title from './components/Title';
import TodoBoardList from './components/TodoBoardList';
import Login from './components/Login';
import { getAuth, GoogleAuthProvider, signInWithPopup, User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { app, getUserData, saveUserData } from "./firebase";
import { isEqual } from 'lodash';
import { getDataOverridePromise, overridePopup } from './util';

export type TodoItemType = {
  id: string;
  text: string;
  extraLines: number;
  animation?: boolean;
  completed?: boolean;
}

export type TodoBoardObject = {
  name: string;
  id: string;
  todoItems: TodoItemType[];
}

function App() {

  const importedTodos = localStorage.getItem('todo-list') ? JSON.parse(localStorage.getItem('todo-list') as string) as TodoBoardObject[] :
  [{
    "name": "",
    "id": "default-board",
    "todoItems": [{
      text: '',
      id: 'default-item',
    }]
  }] as TodoBoardObject[];

  importedTodos.forEach((board: TodoBoardObject) => {
    board.todoItems.forEach((element: TodoItemType) => {
      delete element.animation;
    });
  });

  const [todos, setTodos] = useState(importedTodos);

  const setTodosWrapper = (passedTodos: TodoItemType[], boardID: string) => {
    // clone boards by value
    let todoBoards = todos.slice();
    // find modified board
    let currentBoard = todoBoards.find(obj => obj.id === boardID);
    if (currentBoard === undefined) return;
    // clone modified board by value and set new todo items
    let modifiedBoard = { ...currentBoard, todoItems: passedTodos };
    // find index of old board and replace it with new board
    let index = todoBoards.indexOf(currentBoard);
    todoBoards[index] = modifiedBoard;
    setTodos(todoBoards);
    localStorage.setItem('todo-list', JSON.stringify(todoBoards));
    if (user) saveUserData(user.uid, {'board': modifiedBoard, 'boardIndex': index});
  }

  const handleNameChange = (e: Event, boardID: string) => {
    // clone boards by value
    let todoBoards = todos.slice();
    // find modified board
    let currentBoard = todoBoards.find(obj => obj.id === boardID);
    if (currentBoard === undefined) return;
    // clone modified board by value and set new name
    let modifiedBoard = { ...currentBoard, name: (e.target as HTMLInputElement).value };
    // find index of old board and replace it with new board
    let index = todoBoards.indexOf(currentBoard);
    todoBoards[index] = modifiedBoard;
    setTodos(todoBoards);
    localStorage.setItem('todo-list', JSON.stringify(todoBoards));
    if (user) saveUserData(user.uid, {'board': modifiedBoard, 'boardIndex': index});
  }

  const auth = getAuth(app);

  // get user if signed in
  const [user] = useAuthState(auth);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        compareLocalAndUserData(user, false);
      }
    });
  }, [auth]);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    if (!result || !result.user) {
      return;
    }
    compareLocalAndUserData(result.user, true);
  }

  const logOut = () => {
    auth.signOut();
  }

  const compareLocalAndUserData = async (user: FirebaseUser, newLogin: boolean) => {
    /*
      Order of operations:
        1 - If local data matches user data, leave it as is.
        2 - If user data is empty, save local data to it.
        3 - If local data is empty, set user data to it.
        4 - If user data and local data both exist and are different:
          4.1 - If the user has just logged in, open prompt to overwrite local data.
          4.2 - If the user is already logged in, set local data to user data.
    */
    let userData = await getUserData(user.uid) as TodoBoardObject[];
    // remove animation attr for comparison
    if (userData && Object.keys(userData).length !== 0) { // non-empty user data check
      userData.forEach((board: TodoBoardObject) => {
        board.todoItems.forEach((element: TodoItemType) => {
        delete element.animation;
      })});
    }

    // 1
    if (isEqual(userData, todos)) {
      console.log('Local data matches user data.');
    // 2
    } else if (!userData || Object.keys(userData).length === 0) { // empty
      console.log('User data is empty.');
      saveUserData(user.uid, {'allBoards': todos});
    // 3
    } else if (todos.length === 1 && todos[0].todoItems.length === 1) { // empty apart from placeholder item
      console.log('Local data is empty.');
      setTodos(userData as TodoBoardObject[]);
      localStorage.setItem('todo-list', JSON.stringify(userData));
    // 4
    } else {
      console.log('User data and local data are different.');
      // 4.1
      if (newLogin) {
        overridePopup.show();
        await getDataOverridePromise().then(() => {
          // accepted local override
          setTodos(userData as TodoBoardObject[]);
          localStorage.setItem('todo-list', JSON.stringify(userData));
          overridePopup.hide();
        }).catch(() => {
          // rejected local override (local overrides cloud)
          saveUserData(user.uid, {'allBoards': todos});
          overridePopup.hide();
        });
      // 4.2
      } else {
        setTodos(userData as TodoBoardObject[]);
        localStorage.setItem('todo-list', JSON.stringify(userData));
      }
    }
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
        handleNameChange={handleNameChange}
      />
      <Title title="To Do:" />
    </div>
  );
}

export default App;
