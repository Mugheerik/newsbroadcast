import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, ScrollView } from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig"; // Adjust path as necessary
import moment from "moment"; // To format timestamps
import { Video } from "expo-av"; // Import the Video component

const PostDetailScreen = () => {
  const { id } = useLocalSearchParams(); // Get the id from the route params
  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null); // State to store user details

  useEffect(() => {
    const fetchPost = async () => {
      const postRef = doc(db, "posts", id);
      const postSnapshot = await getDoc(postRef);
      if (postSnapshot.exists()) {
        setPost(postSnapshot.data());
        // Fetch user details if post exists
        const userRef = doc(db, "users", postSnapshot.data().userId);
        const userSnapshot = await getDoc(userRef);
        if (userSnapshot.exists()) {
          setUser(userSnapshot.data()); // Store user details
        }
      } else {
        console.log("No such post!");
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  // Function to check if the media URL is a video
  const isVideo = (url) => {
    if (!url) return false; // Return false if url is undefined or null
    const videoExtensions = [".mp4", ".mov", ".avi", ".mkv"];
    
    // Check if the URL has any of the video extensions before any query parameters
    const urlWithoutParams = url.split("?")[0]; // Remove query parameters
    return videoExtensions.some(ext => urlWithoutParams.endsWith(ext));
  };

  if (!post) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const isMediaVideo = isVideo(post.mediaUrl); // Determine if the media is a video

  return (
    <ScrollView style={styles.container}>
      {/* Render video or image based on the media type */}
      {post.mediaUrl && (
        isMediaVideo ? (
          <Video
            source={{ uri: post.mediaUrl }}
            style={styles.postMedia}
            useNativeControls
            resizeMode="contain"
            isLooping
          />
        ) : (
          <Image source={{ uri: post.mediaUrl }} style={styles.postMedia} />
        )
      )}
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.description}>{post.description}</Text>
        <Text style={styles.user}>Posted by: {user?.name || "Unknown User"}</Text>
        <Text style={styles.date}>
          {moment(post.createdAt?.toDate()).format("MMMM Do YYYY, h:mm:ss a")}
        </Text>
        <Text style={styles.likes}>Likes: {post.likes.length}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f7f7f7",
  },
  postMedia: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    marginBottom: 16,
  },
  detailsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#333",
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
    color: "#555",
  },
  user: {
    fontSize: 14,
    color: "#888",
    marginBottom: 5,
  },
  date: {
    fontSize: 12,
    color: "#999",
    marginBottom: 10,
  },
  likes: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default PostDetailScreen;
