import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Button,
  TextInput,
  Dimensions,
  ActivityIndicator,
  Image,
  FlatList, // Added FlatList import
  Alert,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import usePostViewModel from "../../../ModelView/postViewModel";
import * as ImagePicker from "expo-image-picker";
import { Video } from "expo-av";
import locationData from "../../../../assets/locations.json";

const PostPage = () => {
  const {
    title,
    setTitle,
    description,
    setDescription,
    file,
    setFile,
    mediaType,
    setMediaType,
    category,
    setCategory,
    location,
    setLocation,
    handleCreatePost,
  } = usePostViewModel();

  const [loading, setLoading] = useState(false); // State for loading indicator
  const [openDropdown, setOpenDropdown] = useState(false); // Dropdown state
  const [isCustomInput, setIsCustomInput] = useState(false); // Custom input toggle
  const [customCategory, setCustomCategory] = useState(""); // Custom category value
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [categories, setCategories] = useState([
    { label: "Sports", value: "sports" },
    { label: "Tech", value: "tech" },
    { label: "Entertainment", value: "entertainment" },
    { label: "Crime", value: "crime" },
    { label: "Politics", value: "politics" },
  ]); // Predefined categories

  const pickFile = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission denied",
        "We need permission to access your media."
      );
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedFile = result.assets[0];
      const fileName = selectedFile.uri.split("/").pop();
      setFile({ ...selectedFile, name: fileName });
      setMediaType(selectedFile.type);
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

  const handlePostCreation = async () => {
    const Category = isCustomInput ? customCategory : category;
    if (file && Category) {
      setLoading(true);
      try {
        await handleCreatePost(title, description, file, mediaType, Category);
        onClose();
      } catch (error) {
        console.error("Error creating post:", error);
        alert("Error creating post, please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      alert("Please complete all fields before posting.");
    }
  };

  const onClose = () => {
    setTitle("");
    setDescription("");
    setFile(null);
    setMediaType(null);
    setCategory("");
    alert("Post created successfully.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create a Post</Text>

      <View style={styles.input}>
        <TextInput
          placeholder="Enter Location"
          value={location}
          onChangeText={handleLocationInput}
        />
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
      </View>

      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />

      <DropDownPicker
        open={openDropdown}
        value={category}
        items={categories}
        setOpen={setOpenDropdown}
        setValue={setCategory}
        placeholder="Select a category"
        containerStyle={{ width: "100%", marginVertical: 10 }}
        style={styles.dropdown}
        dropDownStyle={styles.dropdownList}
      />

      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />

      <TouchableOpacity style={styles.button} onPress={pickFile}>
        <Text style={styles.buttonText}>Pick an Image or Video</Text>
      </TouchableOpacity>

      {file && (
        <View style={styles.mediaPreview}>
          {mediaType ? (
            mediaType === "image" ? (
              <Image source={{ uri: file.uri }} style={styles.previewImage} />
            ) : mediaType === "video" ? (
              <Video
                source={{ uri: file.uri }}
                style={styles.previewVideo}
                useNativeControls
                resizeMode="contain"
                onError={(error) => {
                  console.error("Video Error:", error);
                  alert("Error loading video: " + error.message);
                }}
              />
            ) : (
              <Text>Unsupported media type</Text>
            )
          ) : (
            <Text>No media type detected</Text>
          )}
        </View>
      )}

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#28a745"
          style={styles.loadingIndicator}
        />
      ) : (
        <View style={styles.buttonContainer}>
          <Button title="Cancel" onPress={onClose} color="#dc3545" />
          <Button title="Post" onPress={handlePostCreation} color="#28a745" />
        </View>
      )}
    </View>
  );
};

const windowWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    width: "100%",
    backgroundColor: "#fff",
  },
  dropdown: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    maxHeight: 150,
    marginTop: 5,
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
  button: {
    backgroundColor: "black",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 5,
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
  },
  mediaPreview: {
    marginVertical: 10,
    alignItems: "center",
  },
  previewImage: {
    width: windowWidth - 40,
    height: 200,
    borderRadius: 8,
  },
  previewVideo: {
    width: windowWidth - 40,
    height: 200,
    borderRadius: 8,
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});

export default PostPage;
