import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import {
  getDocs,
  collection,
  doc,
  updateDoc,
  addDoc,
  getDoc, // Import getDoc
} from "firebase/firestore";
import { db } from "../../../../firebaseConfig"; // Adjust path as necessary
import { getAuth } from "firebase/auth"; // For getting the admin's UID
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons for the notification icon
import { usePostsViewModel } from "../../../ModelView/pendingViewModel"; // Import the custom hook

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
  // Get the admin's UID
  const { posts, approve, reject } = usePostsViewModel();
  const [userDetails, setUserDetails] = useState({}); // State to hold user details

  // Fetch user details for each post
  useEffect(() => {
    const fetchUserDetails = async () => {
      const userDetailsMap = {};
      for (const post of posts) {
        if (post.userId) {
          const userRef = doc(db, "users", post.userId);
          const userDoc = await getDoc(userRef); // Use getDoc to fetch user data
          if (userDoc.exists()) {
            userDetailsMap[post.userId] = userDoc.data();
          }
        }
      }
      setUserDetails(userDetailsMap);
    };

    fetchUserDetails();
  }, [posts]);

  const renderItem = ({ item }) => {
    const userInfo = userDetails[item.userId] || {}; // Get user details for this post

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{userInfo.name || "Unknown User"}</Text>
        {/* Display User Name */}
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription}>{item.description}</Text>
        {item.mediaUrl && (
          <Image source={{ uri: item.mediaUrl }} style={styles.cardImage} />
        )}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.approveButton}
            onPress={() => approve(item.id, item)}
          >
            <Text style={styles.approveButtonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => reject(item.id, item)}
          >
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginVertical: 5,
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
    width: "100%",
    height: 200,
    borderRadius: 5,
  },
  postList: {
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  approveButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginRight: 10,
  },
  approveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  rejectButton: {
    backgroundColor: "#f44336",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  rejectButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default IndexScreen;
