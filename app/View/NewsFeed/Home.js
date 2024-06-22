import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Button,
  Modal,
  Dimensions,
  Pressable,
  TextInput,
} from "react-native";

import usePostViewModel from "../../ModelView/postViewModel";

// Import your Firebase/Firestore setup and MVVM related files here

const IndexScreen = () => {
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

  const handlePostCreation = async () => {
    if (file) {
      await handleCreatePost(title, description, file, mediaType);
      setModalVisible(false); // Close the modal after post creation
    } else {
      alert("Please select a file.");
    }
  };
  const [modalVisible, setModalVisible] = useState(false);
  const pickFile = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedFile = result.assets[0];
      setFile(selectedFile);
      setMediaType(selectedFile.type);
    }
  };
  // Fetch data from Firestore on component mount

  return (
    <View style={styles.container}>
      {/* Plus button in the bottom right corner */}
      <Pressable
        style={styles.plusButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.plusButtonText}>+</Text>
      </Pressable>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
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
              onPress={() => setModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    width: windowWidth,
    height: windowHeight,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  card: {
    width: "90%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  cardImage: {
    // Style your card image here
  },
  cardTitle: {
    // Style your card title here
  },
  cardDescription: {
    // Style your card description here
  },
  plusButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "black",
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  plusButtonText: {
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "bold",
  },
});

export default IndexScreen;
