import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Share,
  Alert,
  Dimensions
} from "react-native";
import { Link } from "expo-router";
import { getAuth } from "firebase/auth";
import { collection, query, orderBy, onSnapshot, getDocs, doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../../firebaseConfig";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import moment from "moment";
import { Video } from "expo-av"; // Import Video component

const IndexScreen = () => {
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favorites, setFavorites] = useState({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesRef = collection(db, "posts");
        const querySnapshot = await getDocs(categoriesRef);
        const fetchedCategories = querySnapshot.docs.map((doc) => doc.id.toUpperCase());
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      if (selectedCategory === "All") {
        const allPosts = [];
        const unsubscribeFunctions = categories.map((category) => {
          const postsRef = collection(db, "posts", category.toLowerCase(), "posts");
          const q = query(postsRef, orderBy("createdAt", "desc"));

          return onSnapshot(
            q,
            (querySnapshot) => {
              querySnapshot.forEach((doc) => {
                allPosts.push({
                  id: doc.id,
                  category,
                  ...doc.data(),
                });
              });
              allPosts.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
              setPosts([...allPosts]);
              setLoading(false);
            },
            (error) => {
              console.error("Error fetching posts:", error);
            }
          );
        });
        return () => unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
      } else {
        const postsRef = collection(db, "posts", selectedCategory.toLowerCase(), "posts");
        const q = query(postsRef, orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(
          q,
          (querySnapshot) => {
            const categoryPosts = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              category: selectedCategory,
              ...doc.data(),
            }));
            setPosts(categoryPosts);
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching posts:", error);
          }
        );
        return () => unsubscribe();
      }
    };

    if (categories.length > 0) {
      fetchPosts();
    }
  }, [selectedCategory, categories]);

  const renderPost = ({ item }) => {
    const user = getAuth().currentUser;
  
    const handleFavorite = async () => {
      if (!user) {
        Alert.alert("Not logged in", "Please log in to favorite posts.");
        return;
      }
    
      try {
        const userFavoritesRef = collection(db, "users", user.uid, "favorites");
        const postRef = doc(userFavoritesRef, item.id);
    
        // Optimistic UI update: immediately update the favorites state
        setFavorites((prev) => ({ ...prev, [item.id]: !favorites[item.id] }));
    
        if (favorites[item.id]) {
          // If it's already favorited, remove it
          await deleteDoc(postRef);
          Alert.alert("Success", "Post removed from favorites!");
        } else {
          // If it's not favorited, add it
          await setDoc(postRef, {
            ...item,
            favoritedAt: new Date(),
          });
          Alert.alert("Success", "Post added to favorites!");
        }
      } catch (error) {
        console.error("Error updating favorite state: ", error);
        Alert.alert("Error", "Failed to update favorite state.");
        // Revert optimistic UI update on error
        setFavorites((prev) => ({ ...prev, [item.id]: favorites[item.id] }));
      }
    };
  
    const handleShare = async () => {
      try {
        await Share.share({
          message: `Check out this post: ${item.title}\n\n${
            item.mediaUrl || "No media available"
          }`,
        });
      } catch (error) {
        console.error("Error sharing post: ", error);
        Alert.alert("Error", "Failed to share post.");
      }
    };
  
    return (
      <Link href={`/posts/${item.category}/posts/${item.id}`} asChild>
        <TouchableOpacity>
          <View style={styles.card}>
            <View style={styles.imageContainer}>
              {item.mediaType === "video" ? (
                <Video
                  source={{ uri: item.mediaUrl }}
                  rate={1.0}
                  volume={1.0}
                  useNativeControls
                  isMuted={false}
                  resizeMode="cover"
                  shouldPlay={false}
                  isLooping
                  style={styles.media}
                />
              ) : (
                <Image
                  source={{
                    uri: item.mediaUrl || "https://via.placeholder.com/150",
                  }}
                  style={styles.media}
                />
              )}
            </View>
            <View style={styles.content}>
              <Text style={styles.category}>{item.category.toUpperCase()}</Text>
              <Text style={styles.title} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.author}>
                By {item.userName} • {moment(item.createdAt?.toDate()).fromNow()}
              </Text>
              <View style={styles.actions}>
                <TouchableOpacity onPress={handleFavorite}>
                  <Ionicons
                    name={favorites[item.id] ? "bookmark" : "bookmark-outline"}
                    size={24}
                    color={favorites[item.id] ? "red" : "black"}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleShare}>
                  <Ionicons name="share-social-outline" size={24} color="black" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Link>
    );
  };
  
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryTabs}>
        <TouchableOpacity
          style={[styles.tab, selectedCategory === "All" && styles.selectedTab]}
          onPress={() => setSelectedCategory("All")}
        >
          <Text style={[styles.tabText, selectedCategory === "All" && styles.selectedTabText]}>
            All
          </Text>
        </TouchableOpacity>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[styles.tab, selectedCategory === category && styles.selectedTab]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[styles.tabText, selectedCategory === category && styles.selectedTabText]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.subHeader}>Trending Topic</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
  },
  categoryTabs: {
    marginBottom: 10,
    paddingVertical: 5,
    height: 50, // Static height for the tabs container
  },
  tab: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    marginRight: 10,
  },
  selectedTab: {
    backgroundColor: "#007BFF",
  },
  tabText: {
    fontSize: 14,
    color: "#333",
  },
  selectedTabText: {
    color: "#fff",
    fontWeight: "bold",
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  list: {
    flexGrow: 1, // Ensures consistent space for content
    height: Dimensions.get("window").height * 0.75, // Set a fixed height for the list
    paddingBottom: 15,
  },
  card: {
    flexDirection: "row",
    marginVertical: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
  },
  imageContainer: {
    width: 100,
    height: 100,
    backgroundColor: "#e0e0e0",
  },
  media: {
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
    padding: 10,
  },
  category: {
    fontSize: 12,
    color: "#777",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 5,
  },
  author: {
    fontSize: 12,
    color: "#aaa",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
});


export default IndexScreen;
