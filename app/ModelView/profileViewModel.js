// ProfileViewModel.js
import { useState } from 'react';
import { auth } from "../../firebaseConfig";
import { uploadProfilePicture, updateUserProfile, updateUserDataInFirestore } from '../Model/profileModel';

// ViewModel for profile operations
export const useProfileViewModel = () => {
  const [userData, setUserData] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch user data (name, email, photoURL)
  const fetchUserData = async () => {
    const user = auth.currentUser;
    if (user) {
      setUserData({
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      });
      setProfilePicture(user.photoURL);
    }
  };

  // Upload the image and return the download URL
  const uploadImageAsync = async (imageUri) => {
    setLoading(true);
    try {
      const downloadURL = await uploadProfilePicture(imageUri);
      setProfilePicture(downloadURL);
      setLoading(false);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image: ", error);
      setLoading(false);
      return null;
    }
  };

  // Handle profile updates (name, location, password)
  const handleUpdateProfile = async ({ name, location, password }) => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      const updatedPhotoURL = profilePicture;

      // Update displayName and photoURL in Firebase Auth
      await updateUserProfile(name, updatedPhotoURL);

      // Update Firestore data (like location)
      if (user) {
        await updateUserDataInFirestore(user.uid, {name, location,profilePicture });
      }

      // Handle password update
      if (password) {
        await user.updatePassword(password);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error updating profile: ", error);
      setLoading(false);
    }
  };

  return {
    userData,
    profilePicture,
    setProfilePicture,
    handleUpdateProfile,
    uploadImageAsync,
    fetchUserData,
    loading,
  };
};
