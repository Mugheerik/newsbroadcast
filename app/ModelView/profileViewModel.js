import { useState,useEffect } from "react";
import { updateUserProfile, uploadProfilePicture, updateUserDataInFirestore } from "../Model/profileModel";
import { getAuth } from "firebase/auth";// Firebase auth
import { getUserData } from "../Model/getUserModel";

export const useProfileViewModel = () => {
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;
 
  const [userData, setUserData] = useState({});

  // Use useEffect to fetch user data only once when the component mounts
  useEffect(() => {
    const getData = async () => {
      if (user) {
        let userd = await getUserData(user.uid);
        setUserData(userd);
      }
    };

    getData();
  }, [user]);

  // Function to handle profile update
  const handleUpdateProfile = async ({ name, location, password }) => {
    setLoading(true);
    try {
      let photoURL = profilePicture;

      if (profilePicture) {
        // Upload new profile picture if updated
        photoURL = await uploadProfilePicture(profilePicture);
      }

      // Update Firebase Authentication profile
      await updateUserProfile(name, photoURL);

      // Update Firestore with additional user data
      await updateUserDataInFirestore(auth.currentUser.uid, { name, location });

      // If the user updates their password, handle it here
      if (password) {
        await auth.currentUser.updatePassword(password);
      }

      console.log("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile: ", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    userData,
    profilePicture,
    setProfilePicture,
    handleUpdateProfile,
    loading,
  };
};
