import { auth, db, storage } from "../../firebaseConfig" // Import Firebase auth, Firestore, and storage
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

// Function to upload profile picture to Firebase Storage
export const uploadProfilePicture = async (imageUri) => {
  if (!imageUri) return null;

  const response = await fetch(imageUri);
  const blob = await response.blob();
  const storageRef = ref(storage, `profilePictures/${auth.currentUser.uid}`);
  await uploadBytes(storageRef, blob);

  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

// Function to update the user profile in Firebase Authentication
export const updateUserProfile = async (displayName, photoURL) => {
  try {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName,
        photoURL,
      });
    }
  } catch (error) {
    console.error("Error updating profile: ", error);
    throw error;
  }
};

// Function to update Firestore with additional user data
export const updateUserDataInFirestore = async (userId, data) => {
  try {
    const userDocRef = doc(db, "users", userId);
    await setDoc(userDocRef, data, { merge: true }); // Merging so it doesn't overwrite the whole doc
  } catch (error) {
    console.error("Error updating Firestore: ", error);
    throw error;
  }
};
