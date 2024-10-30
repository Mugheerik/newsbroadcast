import { app, db,  } from "../../firebaseConfig"; // Import Firebase auth, Firestore, and storage
import { updateProfile } from "firebase/auth";
import { doc, setDoc,updateDoc } from "firebase/firestore";
import { Alert } from "react-native";
// Function to upload profile picture to Firebase Storage
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";



// Function to update the user profile in Firebase Authentication
export const updateUserProfile = async (url) => {
  const user = getAuth().currentUser; // Get the current user
  if (user && url) { // Check if the user and url are valid
    const userRef = doc(db, "users", user.uid); // Adjust collection name as necessary
    try {
      await updateDoc(userRef, {
        profilePicture: url,
      });
      Alert.alert("Profile picture updated successfully!");
    } catch (error) {
      Alert.alert("Error updating profile:", error.message);
    }
  } else {
    Alert.alert("No user is signed in or URL is undefined.");
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
