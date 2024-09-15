import {React,useEffect, useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { TextInput, Button } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { useProfileViewModel } from "../../ModelView/profileViewModel"; // Import ViewModel
import { AntDesign, MaterialIcons, Entypo } from "@expo/vector-icons"; // Import vector icons

const UpdateProfileForm = () => {
  const {
    userData,
    profilePicture,
    setProfilePicture,
    handleUpdateProfile,
    loading,
  } = useProfileViewModel();

  const [name, setName] = useState(userData.name || "");
  const [email, setEmail] = useState(userData.email || "");
  const [location, setLocation] = useState(userData.location || "");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (userData) {
      setName(userData.name);
      setEmail(userData.email);
      setLocation(userData.location);
      setProfilePicture(userData.photoURL);
    }
  }, [userData]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission denied!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.cancelled) {
      setProfilePicture(result.uri);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>UPDATE PROFILE</Text>
      </View>

      <View style={styles.formContainer}>
        {/* Profile Picture */}
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
          >
            Change Profile Picture
          </Button>
        </View>

        {/* Form Fields */}
        <View style={styles.inputContainer}>
          <AntDesign name="user" size={24} color="black" style={styles.icon} />
          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            theme={{ colors: { primary: "#000000" } }}
          />
        </View>

        <View style={styles.inputContainer}>
          <Entypo name="location" size={24} color="black" style={styles.icon} />
          <TextInput
            label="Location"
            value={location}
            onChangeText={setLocation}
            mode="outlined"
            style={styles.input}
            theme={{ colors: { primary: "#000000" } }}
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons
            name="email"
            size={24}
            color="black"
            style={styles.icon}
          />
          <TextInput
            label="Email"
            value={email}
            disabled
            mode="outlined"
            style={styles.input}
            theme={{ colors: { primary: "#000000" } }}
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons
            name="lock"
            size={24}
            color="black"
            style={styles.icon}
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            mode="outlined"
            style={styles.input}
            theme={{ colors: { primary: "#000000" } }}
          />
        </View>

        <Button
          mode="contained"
          onPress={() => handleUpdateProfile({ name, location, password })}
          style={styles.button}
          labelStyle={{ color: "white" }}
          loading={loading}
          disabled={loading}
        >
          UPDATE PROFILE
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    alignItems: "center",
    padding: 20,
    marginTop: 50,
  },
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "black",
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "white",
    marginLeft: 10,
  },
  icon: {
    marginTop: 10,
  },
  button: {
    marginVertical: 10,
    borderRadius: 20,
    padding: 5,
    backgroundColor: "#242424",
  },
  imageContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  imageButton: {
    backgroundColor: "#242424",
  },
});

export default UpdateProfileForm;
