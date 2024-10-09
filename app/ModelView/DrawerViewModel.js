import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Updated import
import { useRouter } from "expo-router";
import { getUserData } from "../Model/getUserModel";
import { SignOut } from "../Model/signinModel";

export const useDrawerViewModel = () => {
  const [userdata, setUserdata] = useState({});
  const [loading, setLoading] = useState(true); // Optionally handle loading state
  const auth = getAuth();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userData = await getUserData(user.uid);
          setUserdata(userData);
        } catch (error) {
          console.error("Error fetching user data: ", error);
        }
      } else {
        setUserdata({}); // Clear userdata if user is not logged in
      }
      setLoading(false); // Update loading state after data fetching
    });

    return () => unsubscribe(); // Clean up subscription on unmount
  }, [auth]);

  const handleLogout = async () => {
    try {
      await SignOut(auth);
      router.replace("/View/Signin")
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const updateUserProfile = async (displayName, photoURL) => {
    try {
      const user = auth.currentUser;
      if (user) {
        await user.updateProfile({ displayName, photoURL });
        // Optionally, update Firestore or other data sources here
      }
    } catch (error) {
      console.error("Error updating profile: ", error);
    }
  };

  return {
    userdata,
    handleLogout,
    updateUserProfile,
    loading, // Optionally return loading state
  };
};
