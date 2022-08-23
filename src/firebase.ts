import { TodoBoardObject } from "./App";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get } from "firebase/database";
import 'firebase/firestore';
import 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBdlNwXtm3AHkoJzbNJaaXT4Ci9XmWivcg",
    authDomain: "todo-app-4670b.firebaseapp.com",
    projectId: "todo-app-4670b",
    storageBucket: "todo-app-4670b.appspot.com",
    messagingSenderId: "648626412587",
    appId: "1:648626412587:web:a629e8a6c96d47ffeede6e",
    measurementId: "G-8C8LT0QT70"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize database and get a reference to the service
const db = getDatabase(app);

interface UserData {
    board?: TodoBoardObject;
    boardIndex?: number;
    allBoards?: TodoBoardObject[];
}

// save user data
export function saveUserData(userId: string, params: UserData, completed: string[]) {
    set(ref(db, `users/${userId}/completed`), completed);
    if ('board' in params && 'boardIndex' in params)
        set(ref(db, `users/${userId}/boards/${params.boardIndex}`), params.board);
    else if ('allBoards' in params) {
        set(ref(db, `users/${userId}/boards`), params.allBoards);
    } else {
        console.error('saveUserData: invalid params');
    }
}

// get user data
export async function getUserData(userId: string) {
    const snapshot = await get(ref(db, `users/${userId}`));
    const data = snapshot.val();
    if (data.completed === undefined) data.completed = [];
    return data;  
}