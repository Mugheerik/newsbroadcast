import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { Link } from "expo-router";
import { collection, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "../../../../firebaseConfig"; // Adjust path as necessary
import { getAuth } from "firebase/auth";
import { FontAwesome } from "@expo/vector-icons"; // Icons for heart and favorite buttons
import moment from "moment"; // To format timestamps

const Header = () => {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.drawerItem}>
        <Text>Filters Area</Text>
      </TouchableOpacity>
    </View>
  );
};

const IndexScreen = () => {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState({});
  const user = getAuth().currentUser;

  useEffect(() => {
    const unsubscribePosts = onSnapshot(
      collection(db, "posts"),
      (querySnapshot) => {
        const postsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(postsData);
      },
      (error) => {
        console.error("Error fetching posts: ", error);
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
    }// Get user details from users object

    return (
      <Link href={`/posts/${item.id}`} asChild>
        <TouchableOpacity>
          <View style={styles.card}>
            {/* Post Header */}
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

            {/* Post Content */}
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
            </View>

            {item.mediaUrl && (
              <Image source={{ uri: item.mediaUrl }} style={styles.cardImage} />
            )}

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
        </TouchableOpacity>
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
  card: {
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginVertical: 5,
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
  cardImage: {
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
