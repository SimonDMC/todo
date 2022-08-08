import { useState, useEffect } from 'react';
import './App.css';
import Title from './components/Title';
import TodoBoard from './components/TodoBoard';
import Login from './components/Login';
import { getAuth, GoogleAuthProvider, signInWithPopup, User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { app, getUserData, saveUserData } from "./firebase";
import { isEqual } from 'lodash';
import { Popup } from './popup';
import { getDataOverridePromise } from './util';

export type TodoItemType = {
  id: number;
  text: string;
  extraLines: number;
  animation?: boolean;
}

export type TodoBoardObject = {
  name: string;
  todoItems: TodoItemType[];
}

function App() {

  const importedTodos = localStorage.getItem('todo-list') ? JSON.parse(localStorage.getItem('todo-list') as string) as TodoBoardObject :
  {
    "name": "",
    "todoItems": [{
      text: '',
      id: 0,
    }]
  } as TodoBoardObject;

  importedTodos.todoItems.forEach((element: TodoItemType) => {
    delete element.animation;
  });

  const [todos, setTodos] = useState(importedTodos);
  const [nextID, setNextID] = useState(localStorage.getItem('todo-nextID') ? parseInt(localStorage.getItem('todo-nextID')!) : 1);

  const setTodosWrapper = (passedTodos: TodoItemType[]) => {
    let newTodos = { ...todos };
    newTodos.todoItems = passedTodos;
    setTodos(newTodos);
    localStorage.setItem('todo-list', JSON.stringify(newTodos));
    if (user) saveUserData(user.uid, newTodos);
  }

  const setNextIDWrapper = (nextID: number) => {
    setNextID(nextID);
    localStorage.setItem('todo-nextID', nextID.toString());
  }

  const handleNameChange = (e: Event) => {
    let newTodos = { ...todos };
    newTodos.name = (e.target as HTMLTextAreaElement).value;
    setTodos(newTodos);
    localStorage.setItem('todo-list', JSON.stringify(newTodos));
    if (user) saveUserData(user.uid, newTodos);
  }

  const auth = getAuth(app);

  // get user if signed in
  const [user] = useAuthState(auth);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        compareLocalAndUserData(user);
      }
    });
  }, [auth]);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    if (!result || !result.user) {
      return;
    }
    compareLocalAndUserData(result.user);
  }

  const logOut = () => {
    auth.signOut();
  }

  const compareLocalAndUserData = async (user: FirebaseUser) => {
    /*
      Order of operations:
        If local data matches user data, leave it as is.
        If user data is empty, save local data to it.
        If local data is empty, set user data to it.
        If user data and local data both exist and are different, open prompt to overwrite local data.
    */
    let userData = await getUserData(user.uid);
    // remove animation attr for comparison
    if (userData && Object.keys(userData).length !== 0) { // non-empty user data check
      userData.todoItems.forEach((element: TodoItemType) => {
        delete element.animation;
      });
    }
    
    const overridePopup = new Popup({
      title: 'Data Conflict',
      content: `Your cloud data and local data are different. Which one do you want to use?
        big-margin§{btn-refuse-override}[Local Data]     {btn-accept-override}[Cloud Data]`,
      sideMargin: '1.5em',
      fontSizeMultiplier: '1.2',
      dynamicHeight: true,
      backgroundColor: '#FFFEE3',
    });

    if (isEqual(userData, todos)) {
      console.log('Local data matches user data.');
    } else if (!userData || Object.keys(userData).length === 0) { // empty
      console.log('User data is empty.');
      saveUserData(user.uid, todos);
    } else if (todos.todoItems.length === 1) { // empty apart from placeholder item
      console.log('Local data is empty.');
      setTodos(userData as TodoBoardObject);
      localStorage.setItem('todo-list', JSON.stringify(userData));
    } else {
      console.log('User data and local data are different.');
      overridePopup.show();
      getDataOverridePromise().then(() => {
        // accepted local override
        setTodos(userData as TodoBoardObject);
        localStorage.setItem('todo-list', JSON.stringify(userData));
        overridePopup.hide();
      }).catch(() => {
        // rejected local override (local overrides cloud)
        saveUserData(user.uid, todos);
        overridePopup.hide();
      });
    }
  }
  

  return (
    <div className="App">
      <Login 
        loggedIn={user !== null}
        loginWithGoogle={loginWithGoogle}
        logOut={logOut}
      />
      <Title title="To Do:" />
      <TodoBoard 
        todos={todos} 
        setTodos={setTodosWrapper}
        nextID={nextID}
        setNextID={setNextIDWrapper}
        handleNameChange={handleNameChange}
      />
    </div>
  );
}

export default App;
