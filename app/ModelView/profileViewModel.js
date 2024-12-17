import { useState } from "react";
import { getAuth, updateProfile } from "firebase/auth";
import { uploadProfilePictureToStorage, updateUserDataInFirestore } from "../Model/profileModel";
import { Alert } from "react-native";

export const useProfileViewModel = () => {
  const [userData, setUserData] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchUserData = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      setUserData({
        uid: user.uid,
        name: user.displayName || "",
        email: user.email,
        profilePicture: user.photoURL || "",
      });
      setProfilePicture(user.photoURL || "");
    }
  };

  const handleUpdateProfile = async ({ name, location }) => {
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      let uploadedUrl = profilePicture;

      // Upload profile picture if a new one is selected
      if (profilePicture && profilePicture.startsWith("file://")) {
        uploadedUrl = await uploadProfilePictureToStorage(user.uid, profilePicture);
      }

      // Update Firebase Authentication
      await updateProfile(user, { displayName: name, photoURL: uploadedUrl });

      // Update Firestore
      await updateUserDataInFirestore(user.uid, {
        name,
        location,
        profilePicture: uploadedUrl,
      });

      setLoading(false);
      Alert.alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile: ", error);
      setLoading(false);
      Alert.alert("Failed to update profile:", error.message);
    }
  };

  return {
    userData,
    profilePicture,
    setProfilePicture,
    handleUpdateProfile,
    fetchUserData,
    loading,
  };
};
