import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAe4lab01X20YgEyoFJNquWJkBAQsVXYFw",
  authDomain: "prompt-lab-57195.firebaseapp.com",
  projectId: "prompt-lab-57195",
  storageBucket: "prompt-lab-57195.firebasestorage.app",
  messagingSenderId: "790883949786",
  appId: "1:790883949786:web:9ab4583186b8a6163059e3",
  measurementId: "G-MC9S3J7J8B"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
