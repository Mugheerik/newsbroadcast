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
} from "react-native";
import usePostViewModel from "../../../ModelView/postViewModel";
import * as ImagePicker from "expo-image-picker";
import { Video } from "expo-av";

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
    handleCreatePost,
  } = usePostViewModel();

  const [loading, setLoading] = useState(false); // State for loading indicator

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
      console.log("Selected media type:", selectedFile.type); // Log media type
      console.log("Selected file URI:", selectedFile.uri); // Log file URI
      setFile({ ...selectedFile, name: fileName });
      setMediaType(selectedFile.type);
    }
  };

  const handlePostCreation = async () => {
    if (file) {
      setLoading(true); // Set loading to true while creating post
      try {
        await handleCreatePost(title, description, file, mediaType);
        onClose(); // Close the page after post creation
      } catch (error) {
        console.error("Error creating post:", error);
        alert("Error creating post, please try again."); // Notify the user
      } finally {
        setLoading(false);
      }
    } else {
      alert("Please select a file.");
    }
  };

  const handleCancelAndClear = () => {
    setTitle("");
    setDescription("");
    setFile(null);
    setMediaType(null);
    onClose(); // Close the page
  };

  const onClose = () => {
    setTitle("");
    setDescription("");
    setFile(null);
    setMediaType(null);
    // Logic to close or navigate away from the PostPage can be added here
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create a Post</Text>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
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
            <>
              {mediaType === "image" ? (
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
              )}
            </>
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
          <Button
            title="Cancel"
            onPress={handleCancelAndClear}
            color="#dc3545"
          />
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
