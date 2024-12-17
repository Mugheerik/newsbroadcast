import React, { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { TextInput, Button } from "react-native-paper";
import { useProfileViewModel } from "../../ModelView/profileViewModel";
import locationData from "../../../assets/locations.json";

const UpdateProfileForm = () => {
  const {
    userData,
    profilePicture,
    setProfilePicture,
    handleUpdateProfile,
    fetchUserData,
    loading,
  } = useProfileViewModel();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userData) {
      setName(userData.name || "");
      setLocation(userData.location || "");
      setProfilePicture(userData.profilePicture);
    }
  }, [userData]);

  const handleImagePick = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert("Permission to access camera roll is required!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        const selectedImage = result.assets[0].uri;
        setProfilePicture(selectedImage);
      }
    } catch (error) {
      console.error("Error selecting image:", error);
    }
  };

  const handleLocationInput = (text) => {
    setLocation(text);
    if (text.trim() !== "") {
      const results = locationData.filter((item) =>
        item.Name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredLocations(results);
      setShowDropdown(results.length > 0);
    } else {
      setShowDropdown(false);
    }
  };

  const handleSubmit = () => {
    handleUpdateProfile({ name, location });
  };

  return (
   <View  style={styles.container} > 
      {/* Image Section */}
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
          onPress={handleImagePick}
          loading={loading}
          style={styles.button}
        >
          Change Profile Picture
        </Button>
      </View>

      {/* Form Section */}
      <View style={styles.formContainer}>
        <TextInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <TextInput
          placeholder="Enter Location"
          style={styles.input}
          value={location}
          onChangeText={handleLocationInput}
        />

        {/* Dropdown for Locations */}
        {showDropdown && (
          <FlatList
            data={filteredLocations}
            keyExtractor={(item, index) => index.toString()}
            style={styles.dropdown}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setLocation(item.Name);
                  setShowDropdown(false);
                }}
              >
                <Text style={styles.dropdownText}>{item.Name}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
          loading={loading}
        >
          UPDATE PROFILE
        </Button>
      </View>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "white",
    padding: 20,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  button: {
    borderRadius: 20,
    backgroundColor: "black",
  },
  formContainer: {
    flex: 1,
  },
  input: {
    marginVertical: 10,
    backgroundColor: "#fff",
  },
  dropdown: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    maxHeight: 150,
    marginVertical: 5,
  },
  dropdownItem: {
    padding: 10,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
  },
  dropdownText: {
    fontSize: 16,
    color: "black",
  },
  submitButton: {
    marginTop: 20,
    borderRadius: 20,
    backgroundColor: "black",
  },
});

export default UpdateProfileForm;
