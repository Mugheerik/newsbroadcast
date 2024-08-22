// Import necessary functions and modules
import { getAuth } from "firebase/auth";
import { app, db } from "../../firebaseConfig";
import { getStorage } from "firebase/storage"; // Make sure the path is correct
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
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
    console.log("Storage instance:", storage);
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
    console.log("Storage reference path:", storageRef.fullPath);

    // Upload the file to Firebase Storage
    const response = await fetch(file.uri);
    const blob = await response.blob();

    const snapshot = await uploadBytes(storageRef, blob);
    const mediaUrl = await getDownloadURL(snapshot.ref);
    console.log("File uploaded, media URL:", mediaUrl);

    // Create Firestore document for the post
    const postRef = doc(collection(db, "users", user.uid, "posts"));
    await setDoc(postRef, {
      title,
      description,
      mediaUrl,
      mediaType,
      createdAt: serverTimestamp(),
      Approval : "Pending"
    });
    console.log("Post created");
  } catch (error) {
    console.error("Error creating post: ", error);
  }
}
