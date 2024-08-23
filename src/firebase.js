// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAhHGJeGsUSwS_W7d8fhk1WX45qPt-lFV4",
    authDomain: "book-it-7350b.firebaseapp.com",
    projectId: "book-it-7350b",
    storageBucket: "book-it-7350b.appspot.com",
    messagingSenderId: "153382344850",
    appId: "1:153382344850:web:c303b793bdee24f27d6e4b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
