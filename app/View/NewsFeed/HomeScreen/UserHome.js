import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Link } from "expo-router";
import { collection, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db,app } from "../../../../firebaseConfig"; // Adjust path as necessary
import { getAuth } from "firebase/auth";
import { FontAwesome } from "@expo/vector-icons";
import moment from "moment";
import { Video } from "expo-av"; // Importing the Video component from expo-av

const IndexScreen = () => {
  const [posts, setPosts] = useState([]);
  const [videoLoading, setVideoLoading] = useState(false);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app); // Add loading state
  const user = auth.currentUser;

  useEffect(() => {
    const unsubscribePosts = onSnapshot(
      collection(db, "posts"),
      (querySnapshot) => {
        const postsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort posts by createdAt
        const sortedPosts = postsData.sort((a, b) => {
          return b.createdAt.toDate() - a.createdAt.toDate();
        });

        setPosts(sortedPosts);
        setLoading(false); // Set loading to false when posts are fetched
      },
      (error) => {
        console.error("Error fetching posts: ", error);
        setLoading(false); // Ensure loading is false on error
      }
    );

    const unsubscribeUsers = onSnapshot(
      collection(db, "users"),
      (querySnapshot) => {
        const usersData = {};
        querySnapshot.docs.forEach((doc) => {
          usersData[doc.id] = doc.data();
        });
        setUsers(usersData);
      },
      (error) => {
        console.error("Error fetching users: ", error);
      }
    );

    return () => {
      unsubscribePosts();
      unsubscribeUsers();
    };
  }, []);

  const handleLikePost = async (post) => {
    const postRef = doc(db, "posts", post.id);
    const updatedLikes = post.likes.includes(user.uid)
      ? post.likes.filter((uid) => uid !== user.uid)
      : [...post.likes, user.uid];
    await updateDoc(postRef, { likes: updatedLikes });
  };

  const renderItem = ({ item }) => {
    const isLiked = item.likes.includes(user.uid);
    const userProfile = users[item.userId];
    if (!item.id) {
      console.error("Post UID is missing", item);
      return null;
    }

    // Function to check if the URL is a video or image
    const isVideo = (url) => {
      if (!url) return false;
      const videoExtensions = [".mp4", ".mov", ".avi", ".mkv"];
      const urlWithoutParams = url.split("?")[0];
      return videoExtensions.some((ext) => urlWithoutParams.endsWith(ext));
    };

    return (
      <Link href={`/posts/${item.id}`} asChild>
        <TouchableOpacity>
          <View style={styles.card}>
            <View style={styles.headerContainer}>
              <Image
                source={
                  userProfile?.profilePicture
                    ? { uri: userProfile.profilePicture }
                    : require("../../../../assets/images/icon.png")
                }
                style={styles.profileImage}
              />
              <View style={styles.headerTextContainer}>
                <Text style={styles.nameText}>{userProfile?.name}</Text>
                <Text style={styles.timeText}>
                  {moment(item.createdAt?.toDate()).fromNow()}
                </Text>
              </View>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
            </View>

            {/* Render image or video based on the media type */}
            {item.mediaUrl &&
              (isVideo(item.mediaUrl) ? (
                <View>
                  <Video
                    source={{ uri: item.mediaUrl }}
                    style={styles.cardMedia}
                    useNativeControls
                    resizeMode="contain"
                    shouldPlay={false}
                    onLoadStart={() => setVideoLoading(true)}
                    onLoad={() => setVideoLoading(false)}
                    onError={() => {
                      setVideoLoading(false);
                      console.error("Error loading video");
                    }}
                  />
                  {videoLoading && (
                    <ActivityIndicator size="large" color="#0000ff" />
                  )}
                </View>
              ) : (
                <Image
                  source={{ uri: item.mediaUrl }}
                  style={styles.cardMedia}
                />
              ))}

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
        </TouchableOpacity>
      </Link>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.postList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  card: {
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginVertical: 5,
    borderRadius: 5,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  nameText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  timeText: {
    fontSize: 12,
    color: "#777",
  },
  textContainer: {
    marginTop: 10,
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
  cardMedia: {
    width: "100%",
    height: 200,
    borderRadius: 5,
    marginTop: 10,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
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
    paddingHorizontal: 10,
  },
});

export default IndexScreen;
