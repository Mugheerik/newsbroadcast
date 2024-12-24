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
import * as Notifications from "expo-notifications";

// Fetch all unapproved posts across users
export const fetchUnapprovedPosts = async () => {
  const unapprovedPosts = [];
  try {
    const querySnapshot = await getDocs(collection(db, "users"));

    // Iterate through each user's document
    for (const userDoc of querySnapshot.docs) {
      const userUid = userDoc.id;

      // Fetch posts for the user
      const postsSnapshot = await getDocs(
        collection(db, "users", userUid, "posts")
      );

      // Filter unapproved and unrejected posts
      postsSnapshot.forEach((postDoc) => {
        const postData = postDoc.data();
        if (!postData.approved && !postData.rejected) {
          unapprovedPosts.push({ id: postDoc.id, userUid, ...postData });
        }
      });
    }
    return unapprovedPosts;
  } catch (error) {
    console.error("Error fetching unapproved posts:", error);
    return [];
  }
};

// Approve a post and notify the user
export const approvePost = async (adminUid, postId, postData) => {
  const { userUid, id, ...restPostData } = postData; // Exclude post ID from data
  const postRef = doc(db, "users", userUid, "posts", postId);

  try {
    // Update the post as approved
    await updateDoc(postRef, { approved: true });

    // Reference the post's category
    const categoryRef = doc(db, "posts", restPostData.category);
    const categoryDoc = await getDoc(categoryRef);

    // Create the category if it doesn't exist
    if (!categoryDoc.exists()) {
      await setDoc(categoryRef, { created: true });
    }

    // Add the approved post to the category's posts collection
    await setDoc(doc(db, "posts", restPostData.category, "posts", postId), {
      ...restPostData,
      approved: true,
    });

    // Add the approved post to the admin's approvedPosts collection
    await setDoc(doc(db, "admins", adminUid, "approvedPosts", postId), {
      ...restPostData,
      approved: true,
    });

    // Notify the user about approval
    await notifyUser(userUid, "Your post has been approved!");

    console.log("Post approved and user notified successfully");
  } catch (error) {
    console.error("Error approving post:", error);
  }
};

// Reject a post and notify the user
export const rejectPost = async (adminUid, postId, postData) => {
  const { userUid, id, ...restPostData } = postData; // Exclude post ID from data
  const postRef = doc(db, "users", userUid, "posts", postId);

  try {
    // Update the post as rejected and ensure it's not approved
    await updateDoc(postRef, { rejected: true, approved: false });

    // Add the rejected post to the admin's rejectedPosts collection
    await setDoc(doc(db, "admins", adminUid, "rejectedPosts", postId), {
      ...restPostData,
      rejected: true,
      approved: false,
    });

    // Notify the user about rejection
    await notifyUser(userUid, "Your post has been rejected.");

    console.log("Post rejected and user notified successfully");
  } catch (error) {
    console.error("Error rejecting post:", error);
  }
};

// Notify a user via push notifications
const notifyUser = async (userUid, message) => {
  try {
    const userDocRef = doc(db, "users", userUid);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();

    if (userData && userData.expoPushToken) {
      const pushToken = userData.expoPushToken;

      const notificationMessage = {
        to: pushToken,
        sound: "default",
        title: "Post Status Update",
        body: message,
        data: { userId: userUid },
      };

      // Send the notification
      await Notifications.scheduleNotificationAsync({
        content: notificationMessage,
        trigger: null, // Immediate notification
      });

      console.log("Notification sent to user successfully");
    } else {
      console.log("User does not have a push token");
    }
  } catch (error) {
    console.error("Error sending notification to user:", error);
  }
};
