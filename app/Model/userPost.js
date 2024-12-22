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
import * as Notifications from "expo-notifications"; // Import Expo notifications

const storage = getStorage(app);
const FLASK_API_URL = "https://1c28-35-240-204-14.ngrok-free.app";

export async function createPost(
  title,
  description,
  file,
  mediaType,
  category,
  location
) {
  let isAdmin = false;
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

    if (userData && userData.status && userData.status.includes("Admin")) {
      isAdmin = true;
    }

    // Check if push token exists for the admin, if not request permissions and store the token
    if (isAdmin && (!userData.expoPushToken || userData.expoPushToken === "")) {
      await requestNotificationPermissions();  // Request permission
      const pushToken = await Notifications.getExpoPushTokenAsync();
      await setDoc(userDocRef, { expoPushToken: pushToken.data }, { merge: true });
      console.log("Push token stored for admin");
    }

    // Determine the path based on user role
    const categoryPath = isAdmin
      ? `posts/${category}/posts`
      : `users/${user.uid}/posts`;
    if (!categoryPath) {
      throw new Error("Invalid collection path");
    }

    // Prepare post data
    const postData = {
      title,
      description,
      mediaUrl,
      mediaType,
      userId: user.uid,
      userName: userData.name,
      likes: [],
      createdAt: serverTimestamp(),
      approved: isAdmin,
      category,
      location,
    };

    // Add "promotional" tag if the user is an admin
    if (isAdmin) {
      postData.promotional = true;
    }

    // Store the post
    const postRef = doc(collection(db, categoryPath));
    await setDoc(postRef, postData);
    console.log("Post created");
    if (isAdmin) {
      const postRef = doc(collection(db, `users/${user.uid}/posts`));
      await setDoc(postRef, postData);
      console.log("admin Post created");
    }

    // Handle video summarization if media type is video
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

    // Send notification to the admin
    if (!isAdmin) {
      await notifyAdmin(userData);
    }
  } catch (error) {
    console.error("Error creating post: ", error);
  }
}

// Request notification permissions
const requestNotificationPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    alert("Permission not granted for notifications");
  }
};

// Function to notify the admin
const notifyAdmin = async (userData) => {
  try {
    // Fetch the admin user document to get their push token
    const adminUserDocRef = doc(db, "users", "adminUserUID");  // Replace with actual admin UID
    const adminUserDoc = await getDoc(adminUserDocRef);
    const adminData = adminUserDoc.data();

    if (adminData && adminData.expoPushToken) {
      const pushToken = adminData.expoPushToken;

      // Construct the message payload
      const message = {
        to: pushToken,
        sound: "default",
        title: "New Post Created",
        body: `${userData.name} has created a new post in the ${userData.category} category.`,
        data: { userId: userData.uid },
      };

      // Send push notification
      await Notifications.scheduleNotificationAsync({
        content: message,
        trigger: null, // Trigger immediately
      });

      console.log("Notification sent to admin");
    } else {
      console.log("Admin does not have a push token");
    }
  } catch (error) {
    console.error("Error notifying admin: ", error);
  }
};
