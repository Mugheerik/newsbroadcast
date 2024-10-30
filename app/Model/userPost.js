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

export async function createPost(title, description, file, mediaType) {
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

    const storageRef = ref(storage, `posts/${user.uid}/${file.name}`);
    const response = await fetch(file.uri);
    const blob = await response.blob();

    const snapshot = await uploadBytes(storageRef, blob);
    const mediaUrl = await getDownloadURL(snapshot.ref);

    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();

    // Check if userData exists and isAdmin is defined properly
    const isAdmin =
      userData && userData.status && userData.status.includes("Admin");

    // Check if the collection path is valid
    const collectionPath = isAdmin ? "posts" : `users/${user.uid}/posts`;
    if (!collectionPath) {
      throw new Error("Invalid collection path");
    }

    const postData = {
      title,
      description,
      mediaUrl,
      mediaType,
      userId: user.uid,
      likes: [],
      createdAt: serverTimestamp(),
      approved: isAdmin,
    };

    const postRef = doc(collection(db, collectionPath));
    await setDoc(postRef, postData);
    console.log("Post created"); // Upload the post without the summary

    if (mediaType === "video") {
      // Step 1: Initiate request to the Flask app
      const response = await axios.post(`${FLASK_API_URL}/summarize`, {
        video_url: mediaUrl, // Pass the video URI or URL
      });

      const { id } = response.data; // Get the job ID from the response

      // Step 2: Check completion of processing
      let completed = false;
      while (!completed) {
        const statusResponse = await axios.get(`${FLASK_API_URL}/status/${id}`);
        if (statusResponse.data.status === "completed") {
          completed = true;
          const summary = statusResponse.data.summary; // Get the summary

          // Step 3: Update the post with the summary
          await setDoc(postRef, { summary }, { merge: true }); // Merge the summary into the existing post
        } else {
          console.log("Processing video, checking status...");
          await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait before checking again
        }
      }
    }

    console.log("Post created");
  } catch (error) {
    console.error("Error creating post: ", error);
  }
}
