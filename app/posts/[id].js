import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig"; // Adjust path as necessary
import moment from "moment"; // To format timestamps

const PostDetailScreen = () => {
  const { id } = useLocalSearchParams(); // Get the id from the route params
  console.log(id);
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      const postRef = doc(db, "posts", id);
      const postSnapshot = await getDoc(postRef);
      if (postSnapshot.exists()) {
        setPost(postSnapshot.data());
      } else {
        console.log("No such post!");
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  if (!post) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: post.mediaUrl }} style={styles.postImage} />
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.description}>{post.description}</Text>
      <Text style={styles.user}>Posted by: {post.userId}</Text>
      <Text style={styles.date}>
        {moment(post.createdAt?.toDate()).format("MMMM Do YYYY, h:mm:ss a")}
      </Text>
      <Text style={styles.likes}>Likes: {post.likes.length}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  postImage: {
    width: "100%",
    height: 300,
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
  },
  user: {
    fontSize: 14,
    color: "#777",
  },
  date: {
    fontSize: 12,
    color: "#999",
    marginBottom: 10,
  },
  likes: {
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default PostDetailScreen;
