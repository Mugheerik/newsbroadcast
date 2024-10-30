import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  
  Image,
  ActivityIndicator,
} from "react-native";
import { Link } from "expo-router";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "../../../../firebaseConfig";
import { getAuth } from "firebase/auth";
import moment from "moment";
import { Video } from "expo-av";
import { TouchableOpacity } from "react-native";

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
                {videoLoading && <ActivityIndicator size="large" color="#0000ff" />}
              </View>
            ) : (
              <Image
                source={{ uri: item.mediaUrl }}
                style={styles.cardMedia}
              />
            ))}
          <View style={styles.infoContainer}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
          </View>
        </View>

        <View style={styles.likesContainer}>
          <Text style={styles.likesText}>{item.likes.length} Likes</Text>
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
    color: "#ffffff",
    fontWeight: "bold",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  headerTextContainer: {
    justifyContent: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  timestamp: {
    fontSize: 14,
    color: "#888",
  },
  cardContent: {
    padding: 10,
  },
  cardMedia: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginVertical: 10,
  },
  infoContainer: {
    marginTop: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 5,
  },
  cardDescription: {
    fontSize: 16,
    marginBottom: 5,
  },
  likesContainer: {
    padding: 10,
    alignItems: "flex-start",
  },
  likesText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  postList: {
    width: "100%",
    paddingHorizontal: 10,
  },
});

export default Myposts;
