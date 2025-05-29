// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB7U9lF9sunJHRaAFluu2hFId5p9ZkJa6U",
  authDomain: "project-2-4b4bc.firebaseapp.com",
  projectId: "project-2-4b4bc",
  storageBucket: "project-2-4b4bc.firebasestorage.app",
  messagingSenderId: "403309826016",
  appId: "1:403309826016:web:9cea22e93692a914bea585",
  measurementId: "G-WLKWZC5PWY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const fireStore = getFirestore(app);

export default fireStore;