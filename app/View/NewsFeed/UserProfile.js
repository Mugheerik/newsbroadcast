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
    uploadImage,
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
    console.log("Pick Image Function Called");
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
      if (!permissionResult.granted) {
        Alert.alert("Permission to access camera roll is required!");
        return;
      }
  
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
  
      console.log("Image Picker Result:", result); // Log the result to check
  
      if (result.canceled) {
        console.log("Image selection was cancelled."); // Log if cancelled
        return;
      }
  
      // Check if assets exist and log them
      if (result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri; // Accessing URI
        console.log("Selected Image URI:", imageUri); // Log the image URI
  
        if (imageUri) {
         const url= await uploadImage(imageUri);
         setMediaUrl(url); // Call the upload function
        } else {
          console.error("The image URI is undefined.");
          Alert.alert("The selected image does not have a valid URI.");
        }
      } else {
        console.error("No assets found in the result.");
        Alert.alert("No assets found.");
      }
    } catch (error) {
      console.error("Error in pickImage function:", error); // Log any errors that occur
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
          onPress={() => handleUpdateProfile(name,location,password,mediaUrl)}
          style={styles.updateButton}
          loading={loading}
        >
          Update Profile
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    marginBottom: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  formContainer: {
    flex: 1,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  imageButton: {
    marginTop: 8,
  },
  input: {
    marginBottom: 16,
  },
  updateButton: {
    marginTop: 16,
  },
});

export default UpdateProfileForm;
