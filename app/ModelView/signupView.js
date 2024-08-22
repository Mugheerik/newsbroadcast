// viewmodels/signupViewModel.js
import { useState } from "react";
import { signUp } from "../Model/signupModel";
import { signIn } from "../Model/signinModel";
import { saveUserData } from "../Model/usersModel";
import { router } from "expo-router";

export const useSignupViewModel = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async () => {
    try {
      const { user } = await signUp(email, password);
      await saveUserData(user.uid, { name, email, location });
      router.push("/HomeScreen/_layout.tsx");
      console.log("User account created & additional data stored!");
    } catch (error) {
      console.error("Error signing up:", error);
    }
  };

  return {
    name,
    setName,
    email,
    setEmail,
    location,
    setLocation,
    password,
    setPassword,
    handleSignUp,
  };
};
