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
      <View style={styles.card}>
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
        {file && <Text>{`Selected file: ${file.uri}`}</Text>}
        <Button
          style={styles.button}
          title="Post"
          onPress={handlePostCreation}
        />
        <Button
          style={styles.button}
          title="Cancel"
          onPress={handleCancelAndClear}
        />
      </View>
    </View>
  );
};

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.1)", // Light background color
  },
  card: {
    width: windowWidth - 40,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    width: "100%",
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
});

export default PostPage;
