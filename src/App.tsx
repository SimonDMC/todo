import { useState } from 'react';
import './App.css';
import Title from './components/Title';
import TodoBoard from './components/TodoBoard';

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

  const importedTodos = localStorage.getItem('todo-list') ? JSON.parse(localStorage.getItem('todo-list') as string) :
  {
    "name": "",
    "todoItems": [{
      text: '',
      id: 0,
    }]
  };

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
  }

  return (
    <div className="App">
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
