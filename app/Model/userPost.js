


import { getAuth } from "firebase/auth";
import { app, db } from "../../firebaseConfig";
import { getStorage } from "firebase/storage";
import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import axios from "axios";

const storage = getStorage(app);
const FLASK_API_URL = "https://150e-34-125-127-76.ngrok-free.app";

export async function createPost(title, description, file, mediaType, category, location) {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User not authenticated");
    }

    if (!storage) {
      throw new Error("Storage is not initialized");
    }

    if (!file || !file.uri || !file.name) {
      console.error("Invalid file object:", file);
      throw new Error("Invalid file object");
    }

    if (!category || typeof category !== "string") {
      throw new Error("Invalid category field");
    }

    const storageRef = ref(storage, `posts/${user.uid}/${file.name}`);
    const response = await fetch(file.uri);
    const blob = await response.blob();

    const snapshot = await uploadBytes(storageRef, blob);
    const mediaUrl = await getDownloadURL(snapshot.ref);

    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();

    const isAdmin =
      userData && userData.status && userData.status.includes("Admin");

    // Create the path: "posts/<category>"
      // Check if the collection path is valid
      const categoryPath = isAdmin ? `posts/${category}posts` : `users/${user.uid}/posts`;
      if (!categoryPath ) {
        throw new Error("Invalid collection path");
      }
    
    const postData = {
      title,
      description,
      mediaUrl,
      mediaType,
      userId: user.uid,
      userName:userData.name,
      likes: [],
      createdAt: serverTimestamp(),
      approved: isAdmin,
      category, // Include the category in post data
      location,
    };

    // Store the post in the appropriate category inside the "posts" collection
    const postRef = doc(collection(db, categoryPath));
    await setDoc(postRef, postData);
    console.log("Post created");

    if (mediaType === "video") {
      const response = await axios.post(`${FLASK_API_URL}/summarize`, {
        video_url: mediaUrl,
      });

      const { id } = response.data;

      let completed = false;
      while (!completed) {
        const statusResponse = await axios.get(`${FLASK_API_URL}/status/${id}`);
        if (statusResponse.data.status === "completed") {
          completed = true;
          const summary = statusResponse.data.summary;

          await setDoc(postRef, { summary }, { merge: true });
        } else {
          console.log("Processing video, checking status...");
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
    }

    console.log("Post created with summary");
  } catch (error) {
    console.error("Error creating post: ", error);
  }
}

