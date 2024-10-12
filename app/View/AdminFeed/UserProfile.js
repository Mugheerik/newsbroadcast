// UpdateProfileForm.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, Alert } from "react-native";
import { TextInput, Button } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { useProfileViewModel } from "../../ModelView/profileViewModel";

const UpdateProfileForm = () => {
  const {
    userData,
    profilePicture,
    setProfilePicture,
    handleUpdateProfile,
    uploadImageAsync,
    fetchUserData,
    loading,
  } = useProfileViewModel();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");

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

  // Function to pick an image from the device
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission denied",
        "We need permission to access your media."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const { uri } = result;
      const imageUri = await uploadImageAsync(uri); // Upload the image and get the URL
      setProfilePicture(imageUri); // Set the uploaded image URL
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
          onPress={() => handleUpdateProfile({ name, location, password })}
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
