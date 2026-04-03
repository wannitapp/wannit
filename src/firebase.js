import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBwmDk06bgyheCw0u7tIFxU5YTW4voRbEo",
  authDomain: "wannit-874db.firebaseapp.com",
  projectId: "wannit-874db",
  storageBucket: "wannit-874db.firebasestorage.app",
  messagingSenderId: "1054693890126",
  appId: "1:1054693890126:web:e645b127e7f945e9334b1f",
  measurementId: "G-GF9BB442Y1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);