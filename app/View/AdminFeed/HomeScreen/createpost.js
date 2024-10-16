import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Button,
  TextInput,
  Dimensions,
} from "react-native";
import usePostViewModel from "../../../ModelView/postViewModel";
import * as ImagePicker from "expo-image-picker";
import { Video } from "expo-av";

const PostPage = ({ onClose }) => {
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

  const pickFile = async () => {
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

  const handlePostCreation = async () => {
    if (file) {
      await handleCreatePost(title, description, file, mediaType);
      onClose(); // Close the page after post creation
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

  return (
    <View style={styles.container}>
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
      />
      <TouchableOpacity style={styles.button} onPress={pickFile}>
        <Text style={styles.buttonText}>Pick an Image or Video</Text>
      </TouchableOpacity>

      {file && (
        <View style={styles.mediaPreview}>
          {mediaType.startsWith("image/") ? (
            <Image source={{ uri: file.uri }} style={styles.previewImage} />
          ) : (
            <Video
              source={{ uri: file.uri }}
              style={styles.previewVideo}
              useNativeControls
              resizeMode="contain"
              isLooping
            />
          )}
        </View>
      )}

      <Button title="Post" onPress={handlePostCreation} color="#28a745" />
      <Button title="Cancel" onPress={handleCancelAndClear} color="#dc3545" />
    </View>
  );
};

const windowWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa", // Light background color for better contrast
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    width: "100%",
    backgroundColor: "#fff", // White background for inputs
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
});

export default PostPage;
