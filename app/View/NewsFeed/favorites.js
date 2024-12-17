import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Image ,Dimensions,TouchableOpacity} from "react-native";
import { getFirestore, doc, collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import moment from "moment";
import { Link } from "expo-router";

const FavoritesScreen = () => {
  const [favoritePosts, setFavoritePosts] = useState([]); // State to store fetched posts
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    setLoading(true);
    const auth = getAuth();
    const firestore = getFirestore();
    const user = auth.currentUser;

    if (!user) {
      console.error("No user is signed in");
      return;
    }

    try {
      const favoritesRef = collection(firestore, `users/${user.uid}/favorites`);
      const snapshot = await getDocs(favoritesRef);

      const posts = [];
      snapshot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data() });
      });

      setFavoritePosts(posts);
    } catch (error) {
      console.error("Error fetching favorite posts:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const renderPostItem = ({ item }) => (
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
         
        </View>
      </View>
    </TouchableOpacity>
  </Link>
  );

  return (
    <View style={styles.container}>
   
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : favoritePosts.length > 0 ? (
        <FlatList
          data={favoritePosts}
          keyExtractor={(item) => item.id}
          renderItem={renderPostItem}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <Text style={styles.emptyText}>No favorite posts found!</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  postImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  postDescription: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#999",
    marginTop: 20,
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
  }, list: {
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
  author: {
    fontSize: 12,
    color: "#aaa",
  },
});

export default FavoritesScreen;
