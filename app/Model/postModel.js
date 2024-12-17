// PostModel.js
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

export const approvePost = async (adminUid, postId, postData) => {
  const { userUid, id, ...restPostData } = postData; // Destructure to exclude id
  const postRef = doc(db, "users", userUid, "posts", postId);

  // Mark as approved in the user's collection
  await updateDoc(postRef, { approved: true });

  // Check if the category exists before adding the post
  const categoryRef = doc(db, "posts", restPostData.category); // Reference to the category
  const categoryDoc = await getDoc(categoryRef);

  // If category doesn't exist, create it
  if (!categoryDoc.exists()) {
    // You can add a default category or handle it as needed
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
};


// Reject a post
export const rejectPost = async (adminUid, postId, postData) => {
  const { userUid, id, ...restPostData } = postData; // Destructure to exclude id
  const postRef = doc(db, "users", userUid, "posts", postId);

  // Mark as rejected in the user's collection
  await updateDoc(postRef, { rejected: true });

  // Save the rejected post to the admin's rejectedPosts collection with the same post ID
  await setDoc(doc(db, "admins", adminUid, "rejectedPosts", postId), {
    ...restPostData,
    rejected: true,
  });
};

