// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDB-9IDokppDTOf4TmWGbYiQNeheQ6ZSxc",
  authDomain: "j7vj7f.firebaseapp.com",
  databaseURL: "https://j7vj7f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "j7vj7f",
  storageBucket: "j7vj7f.firebasestorage.app",
  messagingSenderId: "261128145678",
  appId: "1:261128145678:web:02314ffb677b4135ca655f",
  measurementId: "G-YZM7VZQCXM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// 2. ADD THIS LINE TO EXPORT THE DATABASE
export const db = getDatabase(app);
