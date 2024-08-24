import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { getDocs, collection, doc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "../../../../firebaseConfig"; // Adjust path as necessary
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons for the notification icon

const Header = () => {
  return (
    <View style={styles.header}>
      <Image
        source={{ uri: "https://example.com/your-image.png" }} // Replace with your image URL
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
    const fetchPostsFromAllUsers = async () => {
      try {
        // Step 1: Fetch all users
        const usersSnapshot = await getDocs(collection(db, "users"));
        const allPosts = [];

        // Step 2: Fetch posts for each user
        for (const userDoc of usersSnapshot.docs) {
          const userUid = userDoc.id;
          const postsSnapshot = await getDocs(collection(db, "users", userUid, "posts"));

          // Collect all posts
          postsSnapshot.forEach((postDoc) => {
            allPosts.push({
              id: postDoc.id,
              userUid: userUid,
              ...postDoc.data(),
            });
          });
        }

        setPosts(allPosts);
      } catch (error) {
        console.error("Error fetching posts from all users: ", error);
      }
    };

    fetchPostsFromAllUsers();
  }, []);

  // Function to approve a post
  const approvePost = async (postId, postData) => {
    try {
      const { userUid } = postData;

      // Update the post's approval status in the user's collection
      const postRef = doc(db, "users", userUid, "posts", postId);
      await updateDoc(postRef, { approval: "approved" });

      // Add the approved post to the main "posts" collection
      await addDoc(collection(db, "posts"), { ...postData, approval: "approved" });

      Alert.alert("Success", "Post approved and copied to main posts collection.");
    } catch (error) {
      console.error("Error approving post: ", error);
      Alert.alert("Error", "Failed to approve the post.");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.textContainer}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription}>{item.description}</Text>
      </View>
      {item.mediaUrl && (
        <Image source={{ uri: item.mediaUrl }} style={styles.cardImage} />
      )}
      <TouchableOpacity
        style={styles.approveButton}
        onPress={() => approvePost(item.id, item)}
      >
        <Text style={styles.approveButtonText}>Approve</Text>
      </TouchableOpacity>
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
    backgroundColor: "#f8f8f8",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerImage: {
    width: 100,
    height: 40,
    resizeMode: "contain",
  },
  notificationIcon: {
    padding: 10,
  },
  card: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginVertical: 5,
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    paddingRight: 10,
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
  cardImage: {
    width: 100,
    height: 80,
    borderRadius: 5,
  },
  postList: {
    paddingHorizontal: 10,
  },
  approveButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 10,
  },
  approveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default IndexScreen;
