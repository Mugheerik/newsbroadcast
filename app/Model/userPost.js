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

const storage = getStorage(app);

export async function createPost(title, description, file, mediaType) {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Check if the storage object is initialized
    if (!storage) {
      throw new Error("Storage is not initialized");
    }

    // Ensure the file object is valid
    if (!file || !file.uri || !file.name) {
      console.error("Invalid file object:", file);
      throw new Error("Invalid file object");
    }

    // Create a reference to Firebase Storage
    const storageRef = ref(storage, `posts/${user.uid}/${file.name}`);
    const response = await fetch(file.uri);
    const blob = await response.blob();

    // Upload the file to Firebase Storage
    const snapshot = await uploadBytes(storageRef, blob);
    const mediaUrl = await getDownloadURL(snapshot.ref);

    // Fetch user data to determine if they are an admin
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();
    const isAdmin =
      userData && userData.status && userData.status.includes("Admin");

    // Define the common post data
    const postData = {
      title,
      description,
      mediaUrl,
      mediaType,
      userId: user.uid,
      likes: [],
      createdAt: serverTimestamp(),
    };

    if (isAdmin) {
      // If the user is an admin, create the post in the main 'posts' collection
      await setDoc(doc(collection(db, "posts")), {
        ...postData,
        approved: true,
      });

      // Also create a copy in the user's personal 'posts' collection
      await setDoc(doc(collection(db, "users", user.uid, "posts")), {
        ...postData,
        approved: true,
      });
    } else {
      // If the user is not an admin, create the post only in the user's personal 'posts' collection
      await setDoc(doc(collection(db, "users", user.uid, "posts")), {
        ...postData,
        approved: false, // Not approved by default
      });
    }

    console.log("Post created");
  } catch (error) {
    console.error("Error creating post: ", error);
  }
}
