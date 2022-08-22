import { useState, useEffect } from 'react';
import './App.css';
import Title from './components/Title';
import TodoBoardList from './components/TodoBoardList';
import Login from './components/Login';
import { getAuth, GoogleAuthProvider, signInWithPopup, User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { app, getUserData, saveUserData } from "./firebase";
import { isEqual } from 'lodash';
import { getDataOverridePromise, overridePopup, randomString } from './util';

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
  animation?: boolean;
}

function App() {

  const importedTodos = localStorage.getItem('todo-list') ? JSON.parse(localStorage.getItem('todo-list') as string) as TodoBoardObject[] :
  [{
    "name": "",
    "id": randomString(6),
    "todoItems": [{
      text: '',
      id: randomString(6),
    }]
  }] as TodoBoardObject[];

  importedTodos.forEach((board: TodoBoardObject) => {
    delete board.animation;
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
    // remove animation
    delete modifiedBoard.animation;
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

  const addBoard = (index: number) => {
    if (todos.length >= 3) return;
    // clone boards by value
    let todoBoards = todos.slice();
    todoBoards.splice(index, 0, {
      name: '',
      id: randomString(6),
      animation: true,
      todoItems: [{
        text: '',
        id: randomString(6),
        extraLines: 0,
      }]
    });
    setTodos(todoBoards);
    localStorage.setItem('todo-list', JSON.stringify(todoBoards));
    if (user) saveUserData(user.uid, {'allBoards': todoBoards});
  }

  const removeBoard = (index: number) => {
    // clone boards by value
    let todoBoards = todos.slice();
    todoBoards.splice(index, 1);
    setTodos(todoBoards);
    localStorage.setItem('todo-list', JSON.stringify(todoBoards));
    if (user) saveUserData(user.uid, {'allBoards': todoBoards});
  }

  const moveBoard = (from: number, to: number) => {
    // clone boards by value
    let todoBoards = todos.slice();
    [todoBoards[from], todoBoards[to]] = [todoBoards[to], todoBoards[from]];
    setTodos(todoBoards);
    localStorage.setItem('todo-list', JSON.stringify(todoBoards));
    if (user) saveUserData(user.uid, {'allBoards': todoBoards});
  }

  const auth = getAuth(app);

  // get user if signed in
  const [user] = useAuthState(auth);

  useEffect(() => {
    onAuthStateChanged(auth, (signedInUser) => {
      if (signedInUser) {
        const loggedIn = localStorage.getItem('TODO-signed-in') === 'true';
        compareLocalAndUserData(signedInUser, !loggedIn);
        console.log(!loggedIn);
        localStorage.setItem('TODO-signed-in', 'true');
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }

  const logOut = () => {
    auth.signOut();
    localStorage.setItem('TODO-signed-in', 'false');
  }

  const compareLocalAndUserData = async (firebaseUser: FirebaseUser, newLogin: boolean) => {
    /*
      Order of operations:
        1 - If local data matches user data, leave it as is.
        2 - If user data is empty, save local data to it.
        3 - If local data is empty, set user data to it.
        4 - If user data and local data both exist and are different:
          4.1 - If the user has just logged in, open prompt to overwrite local data.
          4.2 - If the user is already logged in, set local data to user data.
    */
    let userData = await getUserData(firebaseUser.uid) as TodoBoardObject[];
    // remove animation attributes for comparison
    if (userData && Object.keys(userData).length !== 0) { // non-empty user data check
      userData.forEach((board: TodoBoardObject) => {
        delete board.animation;
        board.todoItems.forEach((element: TodoItemType) => {
          delete element.animation;
        })
      });
    }

    // 1
    if (isEqual(userData, todos)) {
      console.log('Local data matches user data.');
    // 2
    } else if (!userData || Object.keys(userData).length === 0) { // empty
      console.log('User data is empty.');
      saveUserData(firebaseUser.uid, {'allBoards': todos});
    // 3
    } else if (todos.length === 1 && todos[0].todoItems.length === 1) { // empty apart from placeholder item
      console.log('Local data is empty.');
      setTodos(userData);
      localStorage.setItem('todo-list', JSON.stringify(userData));
    // 4
    } else {
      console.log('User data and local data are different.');
      // 4.1
      if (newLogin) {
        overridePopup.show();
        await getDataOverridePromise().then(() => {
          // accepted local override
          setTodos(userData);
          localStorage.setItem('todo-list', JSON.stringify(userData));
          overridePopup.hide();
        }).catch(() => {
          // rejected local override (local overrides cloud)
          saveUserData(firebaseUser.uid, {'allBoards': todos});
          overridePopup.hide();
        });
      // 4.2
      } else {
        setTodos(userData);
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
        addBoard={addBoard}
        removeBoard={removeBoard}
        moveBoard={moveBoard}
      />
      <Title title="To Do:" />
    </div>
  );
}

export default App;
