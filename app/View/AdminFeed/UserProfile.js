// UpdateProfileForm.js
import React, { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { View, Text, StyleSheet, Image, Alert } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { useProfileViewModel } from "../../ModelView/profileViewModel";
import { ref, uploadBytes, getDownloadURL, getStorage } from "firebase/storage";
import { app } from "../../../firebaseConfig";
import { getAuth } from "firebase/auth";

const UpdateProfileForm = () => {
  const {
    userData,
    profilePicture,
    setProfilePicture,
    handleUpdateProfile,
    fetchUserData,
    loading,
  } = useProfileViewModel();

  const auth = getAuth(app);
  const storage = getStorage(app);
  const user = auth.currentUser;
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");

  useEffect(() => {
    fetchUserData(); // Fetch user data when the component mounts
  }, []);

  useEffect(() => {
    if (userData) {
      setName(userData.name);
      setLocation(userData.location || "");
      setProfilePicture(userData.profilePicture);
    }
  }, [userData]);

  const pickImage = async () => {
    try {
      // Request permission to access the media library
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert("Permission to access camera roll is required!");
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      console.log("Image Picker Result:", result); // Log the result to check

      if (!result.canceled) {
        const imageUri = result.uri;
        console.log("Selected Image URI:", imageUri); // Log the image URI
        uploadImage(imageUri); // Call the upload function
      } else {
        console.log("Image selection was cancelled."); // Log if cancelled
      }
    } catch (error) {
      console.error("Error in pickImage function:", error); // Log any errors that occur
    }
  };

  const uploadImage = async (uri) => {
    console.log("Upload Image Function Called with URI:", uri); // Log the URI received

    const user = getAuth().currentUser; // Get the current user
    console.log("Current User:", user); // Log the current user

    if (!user) {
      Alert.alert("No user is logged in.");
      return;
    }

    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      console.log("Blob created:", blob); // Log the blob to check its details

      const storageRef = ref(storage, `profilePictures/${user.uid}`); // Use a unique filename
      await uploadBytes(storageRef, blob); // Await the upload to ensure it completes
      console.log("File uploaded successfully to:", storageRef.fullPath); // Log the storage path

      const url = await getDownloadURL(storageRef);
      console.log("Uploaded Image URL:", url); // Log the uploaded image URL

      if (url) {
        setMediaUrl(url); // Store the URL in your state or context
        updateUserProfile(url); // Call your function to update user data
      } else {
        Alert.alert("Failed to get download URL.");
        console.error("Download URL is undefined.");
      }
    } catch (error) {
      Alert.alert("Error uploading image:", error.message);
      console.error("Upload error:", error); // Log the error for debugging
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>UPDATE PROFILE</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.imageContainer}>
          <Image
            source={
              profilePicture
                ? { uri: profilePicture }
                : require("../../../assets/images/icon.png")
            }
            style={styles.profileImage}
          />
          <Button
            mode="contained"
            onPress={pickImage}
            style={styles.imageButton}
            loading={loading}
          >
            Change Profile Picture
          </Button>
        </View>

        <TextInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          label="Location"
          value={location}
          onChangeText={setLocation}
          style={styles.input}
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={() =>
            handleUpdateProfile({ name, location, password, mediaUrl })
          }
          style={styles.button}
          loading={loading}
        >
          UPDATE PROFILE
        </Button>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  header: { alignItems: "center", padding: 20, marginTop: 50 },
  headerText: { fontSize: 30, fontWeight: "bold", color: "black" },
  formContainer: { paddingHorizontal: 20 },
  imageContainer: { alignItems: "center", marginVertical: 20 },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  imageButton: { backgroundColor: "#242424" },
  input: { marginVertical: 10 },
  button: {
    marginVertical: 10,
    borderRadius: 20,
    padding: 5,
    backgroundColor: "#242424",
  },
});

export default UpdateProfileForm;
