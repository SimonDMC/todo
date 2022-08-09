import { useState, useEffect } from 'react';
import './App.css';
import Title from './components/Title';
import TodoBoard from './components/TodoBoard';
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
      id: 'default',
    }]
  } as TodoBoardObject;

  importedTodos.todoItems.forEach((element: TodoItemType) => {
    delete element.animation;
  });

  const [todos, setTodos] = useState(importedTodos);

  const setTodosWrapper = (passedTodos: TodoItemType[]) => {
    let newTodos = { ...todos };
    newTodos.todoItems = passedTodos;
    setTodos(newTodos);
    localStorage.setItem('todo-list', JSON.stringify(newTodos));
    if (user) saveUserData(user.uid, newTodos);
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
    let userData = await getUserData(user.uid);
    // remove animation attr for comparison
    if (userData && Object.keys(userData).length !== 0) { // non-empty user data check
      userData.todoItems.forEach((element: TodoItemType) => {
        delete element.animation;
      });
    }

    // 1
    if (isEqual(userData, todos)) {
      console.log('Local data matches user data.');
    // 2
    } else if (!userData || Object.keys(userData).length === 0) { // empty
      console.log('User data is empty.');
      saveUserData(user.uid, todos);
    // 3
    } else if (todos.todoItems.length === 1) { // empty apart from placeholder item
      console.log('Local data is empty.');
      setTodos(userData as TodoBoardObject);
      localStorage.setItem('todo-list', JSON.stringify(userData));
    // 4
    } else {
      console.log('User data and local data are different.');
      // 4.1
      if (newLogin) {
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
      // 4.2
      } else {
        setTodos(userData as TodoBoardObject);
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
      <TodoBoard 
        todos={todos} 
        setTodos={setTodosWrapper}
        handleNameChange={handleNameChange}
      />
      <Title title="To Do:" />
    </div>
  );
}

export default App;
