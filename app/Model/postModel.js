import {
  getDocs,
  collection,
  doc,
  updateDoc,
  addDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import * as Notifications from "expo-notifications"; // Import Expo Notifications

// Fetch unapproved posts
export const fetchUnapprovedPosts = async () => {
  const unapprovedPosts = [];
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    for (const userDoc of querySnapshot.docs) {
      const userUid = userDoc.id;
      const postsSnapshot = await getDocs(
        collection(db, "users", userUid, "posts")
      );
      postsSnapshot.forEach((postDoc) => {
        const postData = postDoc.data();
        if (!postData.approved && !postData.rejected) {
          unapprovedPosts.push({ id: postDoc.id, userUid, ...postData });
        }
      });
    }
    return unapprovedPosts;
  } catch (error) {
    console.error("Error fetching unapproved posts: ", error);
    return [];
  }
};

// Approve a post and notify the user
export const approvePost = async (adminUid, postId, postData) => {
  const { userUid, id, ...restPostData } = postData; // Destructure to exclude id
  const postRef = doc(db, "users", userUid, "posts", postId);

  try {
    // Mark as approved in the user's collection
    await updateDoc(postRef, { approved: true });

    // Check if the category exists before adding the post
    const categoryRef = doc(db, "posts", restPostData.category); // Reference to the category
    const categoryDoc = await getDoc(categoryRef);

    // If category doesn't exist, create it
    if (!categoryDoc.exists()) {
      await setDoc(categoryRef, { created: true }); // Creating the category if it doesn't exist
    }

    // Save the approved post under the correct category in the "posts" collection with the same post ID
    await setDoc(doc(db, "posts", restPostData.category, "posts", postId), {
      ...restPostData,
      approved: true,
    });

    // Save the approved post to the admin's approvedPosts collection with the same post ID
    await setDoc(doc(db, "admins", adminUid, "approvedPosts", postId), {
      ...restPostData,
      approved: true,
    });

    // Notify the user about the approval
    await notifyUser(userUid, "Your post has been approved!");

    console.log("Post approved and user notified");
  } catch (error) {
    console.error("Error approving post: ", error);
  }
};

// Reject a post and notify the user
export const rejectPost = async (adminUid, postId, postData) => {
  const { userUid, id, ...restPostData } = postData; // Destructure to exclude id
  const postRef = doc(db, "users", userUid, "posts", postId);

  try {
    // Mark as rejected in the user's collection
    await updateDoc(postRef, { rejected: true });

    // Save the rejected post to the admin's rejectedPosts collection with the same post ID
    await setDoc(doc(db, "admins", adminUid, "rejectedPosts", postId), {
      ...restPostData,
      rejected: true,
    });

    // Notify the user about the rejection
    await notifyUser(userUid, "Your post has been rejected!");

    console.log("Post rejected and user notified");
  } catch (error) {
    console.error("Error rejecting post: ", error);
  }
};

// Function to notify the user
const notifyUser = async (userUid, message) => {
  try {
    // Fetch the user document to get their push token
    const userDocRef = doc(db, "users", userUid);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();

    if (userData && userData.expoPushToken) {
      const pushToken = userData.expoPushToken;

      // Construct the message payload
      const notificationMessage = {
        to: pushToken,
        sound: "default",
        title: "Post Status Update",
        body: message,
        data: { userId: userUid },
      };

      // Send push notification
      await Notifications.scheduleNotificationAsync({
        content: notificationMessage,
        trigger: null, // Trigger immediately
      });

      console.log("Notification sent to user");
    } else {
      console.log("User does not have a push token");
    }
  } catch (error) {
    console.error("Error notifying user: ", error);
  }
};
