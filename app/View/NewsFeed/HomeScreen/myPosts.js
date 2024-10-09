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
  collection,
  onSnapshot,
  updateDoc,
  doc,
  getDoc, // Import getDoc to retrieve documents
} from "firebase/firestore";
import { db } from "../../../../firebaseConfig"; // Adjust path as necessary
import { getAuth } from "firebase/auth";
import { FontAwesome } from "@expo/vector-icons"; // Icons for heart and favorite buttons
import moment from "moment"; // To format timestamps

const Myposts = () => {
  const [posts, setPosts] = useState([]);
  const [userDetails, setUserDetails] = useState({}); // State to store user details
  const user = getAuth().currentUser;

  useEffect(() => {
    if (user) {
      // Fetch posts
      const unsubscribe = onSnapshot(
        collection(db, "users", user.uid, "posts"),
        (querySnapshot) => {
          const postsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Fetch user details for each post
          postsData.forEach(async (post) => {
            const userRef = doc(db, "users", post.userId); // Assuming each post has a userId field
            const userDoc = await getDoc(userRef); // Use getDoc instead of get
            if (userDoc.exists()) {
              setUserDetails((prev) => ({
                ...prev,
                [post.userId]: userDoc.data(),
              }));
            }
          });

          setPosts(postsData);
        },
        (error) => {
          console.error("Error fetching posts: ", error);
        }
      );

      return () => unsubscribe();
    }
  }, []);

  // Function to handle like
  const handleLikePost = async (post) => {
    const postRef = doc(db, "users", user.uid, "posts", post.id);

    // Ensure post.likes is defined; if not, default to an empty array
    const updatedLikes = Array.isArray(post.likes) ? post.likes : [];

    const isLiked = updatedLikes.includes(user.uid);

    const newLikes = isLiked
      ? updatedLikes.filter((uid) => uid !== user.uid) // Remove like
      : [...updatedLikes, user.uid]; // Add like

    await updateDoc(postRef, { likes: newLikes });
  };

  const renderItem = ({ item }) => {
    const postDate = item.createdAt ? item.createdAt.toDate() : null;
    const formattedDate = postDate
      ? moment(postDate).fromNow()
      : "No date available";
    const isLiked = item.likes.includes(user.uid);
    const userInfo = userDetails[item.userId] || {}; // Get user details for this post

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

        {/* Post Header */}
        <View style={styles.headerContainer}>
          {userInfo.userProfilePic && (
            <Image
              source={{ uri: userInfo.userProfilePic }}
              style={styles.profileImage}
            />
          )}
          <View style={styles.headerTextContainer}>
            <Text style={styles.userName}>
              {userInfo.name || "Unknown User"}
            </Text>
            <Text style={styles.timestamp}>{formattedDate}</Text>
          </View>
        </View>

        {/* Post Content */}
        <View style={styles.cardContent}>
          {item.mediaUrl && (
            <Image source={{ uri: item.mediaUrl }} style={styles.cardImage} />
          )}
          <View style={styles.infoContainer}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
          </View>
        </View>

        {/* Post Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            onPress={() => handleLikePost(item)}
            style={styles.actionButton}
          >
            <FontAwesome
              name={isLiked ? "heart" : "heart-o"}
              size={24}
              color={isLiked ? "red" : "black"}
            />
            <Text style={styles.actionText}>{item.likes.length}</Text>
          </TouchableOpacity>
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
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerTextContainer: {
    justifyContent: "center",
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
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
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 5,
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 5,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    marginLeft: 5,
    fontSize: 16,
  },
  postList: {
    width: "100%",
    paddingHorizontal: 10,
  },
});

export default Myposts;
