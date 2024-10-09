// firebaseConfig.js

import { initializeApp, getApps } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyC4hV9yEPvXN5fDx0pTPSUQjziTYhuyghI",
  authDomain: "region-times.firebaseapp.com",
  projectId: "region-times",
  storageBucket: "region-times.appspot.com",
  messagingSenderId: "721765024219",
  appId: "1:721765024219:web:84f54af6a5cc0ca29827fe",
  measurementId: "G-50DKDS46TY",
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

const db = getFirestore(app);


console.log("Firebase app initialized:", app);
console.log("Firebase auth initialized:", auth);
console.log("Firestore initialized:", db);


export { app, auth, db };
