import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Image } from "react-native";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../../../firebaseConfig"; // Adjust path as necessary
import { getAuth } from "firebase/auth";

const Myposts = () => {
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

  const renderItem = ({ item }) => {
    // Convert Firestore Timestamp to JavaScript Date
    const postDate = item.createdAt ? item.createdAt.toDate() : null;
    const formattedDate = postDate ? postDate.toLocaleString() : "No date available";

    return (
      <View style={styles.card}>
        {/* Approval Status Banner */}
        <View
          style={[
            styles.statusBanner,
            { backgroundColor: item.approved ? "green" : "red" },
          ]}
        >
          <Text style={styles.statusText}>
            {item.approved ? "Approved" : "Not Approved"}
          </Text>
        </View>
        <View style={styles.cardContent}>
          {/* Post Image */}
          {item.mediaUrl && (
            <Image source={{ uri: item.mediaUrl }} style={styles.cardImage} />
          )}
          {/* User Details and Post Info */}
          <View style={styles.infoContainer}>
            {/* User Profile */}
            <View style={styles.userDetails}>
              {item.userProfilePic && (
                <Image
                  source={{ uri: item.userProfilePic }}
                  style={styles.profileImage}
                />
              )}
              <Text style={styles.userName}>{item.userName}</Text>
            </View>
            {/* Post Title and Description */}
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
            {/* Formatted Timestamp */}
            <Text style={styles.timestamp}>{formattedDate}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
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
  card: {
    width: "100%",
    marginVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  statusBanner: {
    width: "100%",
    paddingVertical: 5,
    alignItems: "center",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  statusText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  cardContent: {
    flexDirection: "row",
    padding: 10,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  infoContainer: {
    flex: 1,
  },
  userDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 5,
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 5,
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
  },
  postList: {
    width: "100%",
    paddingHorizontal: 10,
  },
});

export default Myposts;
