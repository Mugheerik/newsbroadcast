// ProfileViewModel.js
import { useState } from 'react';
import {  updateUserProfile, updateUserDataInFirestore } from '../Model/profileModel';
import { getAuth, updatePassword } from "firebase/auth";

export const useProfileViewModel = () => {
  const [userData, setUserData] = useState(null);
  const [profilePicture, setProfilePicture] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchUserData = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setUserData({
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.profilePicture, // Corrected property
      });
      setProfilePicture(user.profilePicture);
    }
  };
 const uploadImage = async (uri) => {
    console.log("Upload Image Function Called with URI:", uri); // Log the URI received
  
    if (!user) {
      Alert.alert("No user is logged in.");
      return;
    }
  
    try {
      const response = await fetch(uri);
      if (!response.ok) {
        Alert.alert("Failed to fetch the image.");
        console.error("Fetch response status:", response.status);
        return;
      }
  
      const blob = await response.blob();
      console.log("Blob created:", blob); // Log the blob to check its details
  
      const storageRef = ref(storage, `profilePictures/${user.uid}`); // Use a unique filename
      await uploadBytes(storageRef, blob); // Await the upload to ensure it completes
      console.log("File uploaded successfully to:", storageRef.fullPath); // Log the storage path
  
      const url = await getDownloadURL(storageRef);
      console.log("Uploaded Image URL:", url); // Log the uploaded image URL
  
      if (url) {
        setMediaUrl(url); // Store the URL in your state or context
        setProfilePicture(url); // Update profile picture in the view model
      } else {
        Alert.alert("Failed to get download URL.");
        console.error("Download URL is undefined.");
      }
    } catch (error) {
      Alert.alert("Error uploading image:", error.message);
      console.error("Upload error:", error); // Log the error for debugging
    }
  };
  // const uploadImageAsync = async (file) => {
  //   setLoading(true);
  //   try {
  //     if (!file || !file.uri) {
  //       console.error("Invalid file object:", file);
  //       throw new Error("Invalid file object");
  //     }
  
  //     const downloadURL = await uploadProfilePicture(file);
  //     console.log("Downloaded URL:", downloadURL);
  //     setProfilePicture(downloadURL);
  //     setLoading(false);
  //     return downloadURL;
  //   } catch (error) {
  //     console.error("Error uploading image:", error);
  //     setLoading(false);
  //     return null;
  //   }
  // };

  const handleUpdateProfile = async ({ name, location, password,mediaUrl }) => {
    try {
      setLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;
      const updatedPhotoURL = mediaUrl;

      await updateUserProfile(updatedPhotoURL);

      if (user) {
        await updateUserDataInFirestore(user.uid, {
          name,
          location,
          
        });
      }

      if (user && password) {
        await updatePassword(user, password);
      }

      setLoading(false);
      console.log("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile: ", error);
      setLoading(false);
    }
  };

  return {
    userData,
    profilePicture,
    setProfilePicture,
    uploadImage,
    handleUpdateProfile,
    fetchUserData,
    loading,
  };
};
