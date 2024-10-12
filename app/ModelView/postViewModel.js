import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig"; // Adjust path as necessary
import { getAuth } from "firebase/auth";
import { createPost } from "../Model/userPost.js"; // Import the createPost function

const usePostViewModel = () => {
  const [posts, setPosts] = useState([]); // Initialized as an empty array
  const [userDetails, setUserDetails] = useState({}); // Initialize as an object
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [mediaType, setMediaType] = useState("");
  const user = getAuth().currentUser;

  useEffect(() => {
    if (user) {
      // Fetch posts
      const unsubscribePosts = onSnapshot(
        collection(db, "users", user.uid, "posts"),
        async (querySnapshot) => {
          const postsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Prepare an array of userIds to fetch user details
          const userIds = postsData.map((post) => post.userId);

          const userDetailsMap = {};
          // Fetch user details for all unique userIds
          await Promise.all(
            userIds.map(async (userId) => {
              try {
                const userRef = doc(db, "users", userId);
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                  userDetailsMap[userId] = userDoc.data();
                } else {
                  console.warn(`User ID ${userId} does not exist`);
                }
              } catch (error) {
                console.error(
                  `Error fetching user details for ID ${userId}: `,
                  error
                );
              }
            })
          );

          // Update state
          setPosts(postsData);
          setUserDetails(userDetailsMap);
        },
        (error) => {
          console.error("Error fetching posts: ", error);
        }
      );

      return () => {
        unsubscribePosts(); // Cleanup on unmount
      };
    }
  }, [user]);

  // Function to handle like
  const handleLikePost = async (post) => {
    if (!post || !user) return; // Check for post and user existence
    const postRef = doc(db, "posts", post.id);
    const updatedLikes = Array.isArray(post.likes) ? post.likes : [];
    const isLiked = updatedLikes.includes(user.uid);
    const newLikes = isLiked
      ? updatedLikes.filter((uid) => uid !== user.uid) // Remove like
      : [...updatedLikes, user.uid]; // Add like

    try {
      await updateDoc(postRef, { likes: newLikes });
    } catch (error) {
      console.error("Error updating likes: ", error);
    }
  };

  // Function to handle creating a new post
  const handleCreatePost = async () => {
    if (title && description && file && mediaType) {
      try {
        await createPost(title, description, file, mediaType);
        setTitle("");
        setDescription("");
        setFile(null);
        setMediaType("");
      } catch (error) {
        console.error("Error creating post: ", error);
      }
    } else {
      console.log("All fields are required");
    }
  };



  return {
    posts,
    userDetails,
    title,
    setTitle,
    description,
    setDescription,
    file,
    setFile,
    mediaType,
    setMediaType,
    handleCreatePost,
    handleLikePost,
   
  };
};

export default usePostViewModel;
