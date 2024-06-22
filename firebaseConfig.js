// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
 const firebaseConfig = {
  apiKey: "AIzaSyC4hV9yEPvXN5fDx0pTPSUQjziTYhuyghI",
  authDomain: "region-times.firebaseapp.com",
  projectId: "region-times",
  storageBucket: "region-times.appspot.com",
  messagingSenderId: "721765024219",
  appId: "1:721765024219:web:84f54af6a5cc0ca29827fe",
  measurementId: "G-50DKDS46TY",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


export default {app,auth,db,storage}
