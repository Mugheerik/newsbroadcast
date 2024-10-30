import { useState } from "react";

import { signIn } from "../Model/signinModel"; // Assuming you have a similar authModel for sign-in
import { getUserData } from "../Model/getUserModel"; // Assuming you have a function to retrieve user data
import { useRouter } from "expo-router";

export const useSignInViewModel = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const handleSignIn = async () => {
    try {
      const userCredential = await signIn(email, password); // Sign in the user
      const userData = await getUserData(userCredential.user.uid);

      if (userData.status === "Admin") {
        router.push("/View/AdminFeed/AdminHomeScreen/Home");
      } else {
        router.push("/View/NewsFeed/HomeScreen/UserHome");
      }
      // Get user data from Firestore using the user's UID
      console.log("User data:", userData);
      console.log("User signed in successfully!");
      // Handle navigation or any other action after sign-in
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    handleSignIn,
  };
};
