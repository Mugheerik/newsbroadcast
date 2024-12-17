import React, { useState, useEffect, useCallback } from "react";
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
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../../../firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { usePostsViewModel } from "../../../ModelView/pendingViewModel";
import { Video } from "expo-av";

// Constants
const VIDEO_EXTENSIONS = [".mp4", ".mov", ".avi", ".mkv"];

// Header Component
const Header = React.memo(() => (
  <View style={styles.header}>
    <Image
      source={{ uri: "https://example.com/your-image.png" }}
      style={styles.headerImage}
    />
    <TouchableOpacity style={styles.notificationIcon}>
      <Ionicons name="notifications-outline" size={24} color="black" />
    </TouchableOpacity>
  </View>
));

// User Info Component
const UserInfo = React.memo(({ userInfo, time }) => (
  <View style={styles.userInfo}>
    <Image
      source={{ uri: userInfo?.profilePicture || "https://example.com/default-avatar.png" }}
      style={styles.profileImage}
    />
    <View style={styles.userText}>
      <Text style={styles.username}>{userInfo?.name || "Unknown User"}</Text>
      <Text style={styles.postTime}>{time}</Text>
    </View>
  </View>
));

const IndexScreen = () => {
  const { posts, approve, reject } = usePostsViewModel();
  const [userDetails, setUserDetails] = useState({});
  const [videoLoading, setVideoLoading] = useState(false);

  const fetchUserDetails = useCallback(async () => {
    try {
      const userDetailsMap = {};
      await Promise.all(
        posts.map(async (post) => {
          if (post.userId && !userDetailsMap[post.userId]) {
            const userRef = doc(db, "users", post.userId);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
              userDetailsMap[post.userId] = userDoc.data();
            }
          }
        })
      );
      setUserDetails(userDetailsMap);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  }, [posts]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  const isVideo = useCallback(
    (url) => {
      if (!url) return false;
      const urlWithoutParams = url.split("?")[0];
      return VIDEO_EXTENSIONS.some((ext) => urlWithoutParams.endsWith(ext));
    },
    []
  );

  const renderItem = ({ item }) => {
    const userInfo = userDetails[item.userId] || {};
    return (
      <Link href={`/posts/${item.id}`} asChild>
        <View style={styles.card}>
          <UserInfo userInfo={userInfo} time={item.time} />

          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDescription}>
            {item.summary || item.description}
          </Text>

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
                  onError={(error) => {
                    setVideoLoading(false);
                    console.error("Error loading video:", error);
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

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() => reject(item.id, item)}
            >
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.approveButton}
              onPress={() => approve(item.id, item)}
            >
              <Text style={styles.approveButtonText}>Approve</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Link>
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

// Styles
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
    borderRadius: 5,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userText: {
    flexDirection: "column",
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  postTime: {
    fontSize: 12,
    color: "#777",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 5,
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  approveButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    width: "45%",
    alignItems: "center",
  },
  rejectButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    width: "45%",
    alignItems: "center",
  },
  approveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  rejectButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  postList: {
    paddingBottom: 10,
  },
});

export default IndexScreen;
