import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  
} from "react-native";
import { getAuth } from "firebase/auth";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../../firebaseConfig";

import moment from "moment";
import { Video } from "expo-av";


const Myposts = () => {
  const [posts, setPosts] = useState([]);
  const [userDetails, setUserDetails] = useState({});
  const user = getAuth().currentUser;
  const [videoLoading, setVideoLoading] = useState(false);



  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(
        collection(db, "users", user.uid, "posts"),
        (querySnapshot) => {
          const postsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          postsData.forEach(async (post) => {
            const userRef = doc(db, "users", post.userId);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
              setUserDetails((prev) => ({
                ...prev,
                [post.userId]: userDoc.data(),
              }));
            }
          });

          const sortedPosts = postsData.sort(
            (a, b) => b.createdAt - a.createdAt
          );
          setPosts(sortedPosts);
        },
        (error) => {
          console.error("Error fetching posts: ", error);
        }
      );

      return () => unsubscribe();
    }
  }, []);

  const deletePost = async (postId) => {
    const postRef = doc(db, "users", user.uid, "posts", postId);

    // Check if the post is approved before allowing deletion
    const postDoc = await getDoc(postRef);
    if (postDoc.exists() && postDoc.data().approved) {
      alert("This post is approved and cannot be deleted.");
      return;
    }

    // Delete the post if it is not approved
    await deleteDoc(postRef);
    alert("Post deleted successfully.");
  };

  const renderItem = ({ item }) => {
    const postDate = item.createdAt ? item.createdAt.toDate() : null;
    const formattedDate = postDate
      ? moment(postDate).fromNow()
      : "No date available";
    const userInfo = userDetails[item.userId] || {};
    const isVideo = (url) => {
      if (!url) return false;
      const videoExtensions = [".mp4", ".mov", ".avi", ".mkv"];
      const urlWithoutParams = url.split("?")[0];
      return videoExtensions.some((ext) => urlWithoutParams.endsWith(ext));
    };

    return (
      <View style={styles.card}>
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

        <View style={styles.headerContainer}>
          {userInfo.photoURL && (
            <Image
              source={{ uri: userInfo.photoURL }}
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

        <View style={styles.cardContent}>
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
              <Image source={{ uri: item.mediaUrl }} style={styles.cardMedia} />
            ))}
          <View style={styles.infoContainer}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
          </View>
        </View>

       

        {/* Delete Button */}
        {!item.approved && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deletePost(item.id)}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        )}
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
    overflow: "hidden",
  },
  statusBanner: {
    width: "100%",
    paddingVertical: 5,
    alignItems: "center",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  statusText: {
    color: "#fff",
    fontWeight: "bold",
  },
  headerContainer: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerTextContainer: {
    marginLeft: 10,
  },
  userName: {
    fontWeight: "bold",
  },
  timestamp: {
    fontSize: 12,
    color: "#555",
  },
  cardContent: {
    padding: 10,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  cardDescription: {
    fontSize: 14,
    color: "#555",
  },
  cardMedia: {
    width: "100%",
    height: 200,
    marginBottom: 10,
  },
  infoContainer: {
    padding: 5,
  },
  likesContainer: {
    padding: 10,
    alignItems: "center",
  },
  likesText: {
    fontSize: 14,
    color: "#555",
  },
  deleteButton: {
    padding: 10,
    backgroundColor: "#d9534f",
    alignItems: "center",
    borderRadius: 5,
    marginBottom: 10,
   
  },
  deleteText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default Myposts;
