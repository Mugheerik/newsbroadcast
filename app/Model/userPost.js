
import { getAuth } from "firebase/auth";
import { db,storage } from "../../firebaseConfig"; // Adjust the import path as necessary
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function createPost(title, description, file, mediaType) {
  try {

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User not authenticated");
    }
 // Upload the file to Firebase Storage
    const storageRef = ref(storage, `posts/${user.uid}/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const mediaUrl = await getDownloadURL(snapshot.ref);


    const postRef = doc(collection(db, "users", user.uid, "posts"));
    await setDoc(postRef, {
        title,
        description,
        mediaUrl,
        mediaType,
        createdAt: serverTimestamp(),
      });
      console.log("Post created");
  } catch (error) {
    console.error("Error creating post: ", error);
  }
}
