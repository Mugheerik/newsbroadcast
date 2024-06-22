import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "../../firebaseConfig";

const auth = getAuth(app);

export const signIn = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};
