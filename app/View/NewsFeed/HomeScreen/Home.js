import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from "react-native";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../../../firebaseConfig"; // Adjust path as necessary
import { getAuth } from "firebase/auth";
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for the notification icon

const Header = () => {
  return (
    <View style={styles.header}>
      <Image
        source={{ uri: 'https://example.com/your-image.png' }} // Replace with your image URL
        style={styles.headerImage}
      />
      <TouchableOpacity style={styles.notificationIcon}>
        <Ionicons name="notifications-outline" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
};

const IndexScreen = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const user = getAuth().currentUser;
        if (user) {
          const querySnapshot = await getDocs(
            collection(db, "users", user.uid, "posts")
          );
          const postsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setPosts(postsData);
        }
      } catch (error) {
        console.error("Error fetching posts: ", error);
      }
    };

    fetchPosts();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.textContainer}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription}>{item.description}</Text>
        {/* <Text style={styles.cardSource}>{item.Approval}</Text>  */}
      </View>
      {item.mediaUrl && (
        <Image source={{ uri: item.mediaUrl }} style={styles.cardImage} />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Header />
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.postList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#f8f8f8", // Adjust background color as needed
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerImage: {
    width: 100, // Adjust width as needed
    height: 40, // Adjust height as needed
    resizeMode: "contain",
  },
  notificationIcon: {
    padding: 10,
  },
  card: {
    flexDirection: "row", // Align items horizontally
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginVertical: 5,
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    paddingRight: 10, // Add some space between text and image
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  cardDescription: {
    fontSize: 14,
    color: "#777",
    marginVertical: 5,
  },
  cardSource: {
    fontSize: 12,
    color: "#888",
  },
  cardImage: {
    width: 100, // Adjust width as needed
    height: 80,  // Adjust height as needed
    borderRadius: 5,
  },
  postList: {
    paddingHorizontal: 10,
  },
});

export default IndexScreen;
