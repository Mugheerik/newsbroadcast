// PostModel.js
import {
  getDocs,
  collection,
  doc,
  updateDoc,
  addDoc,
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

// Approve a post
export const approvePost = async (adminUid, postId, postData) => {
  const { userUid, id, ...restPostData } = postData; // Destructure to exclude id
  const postRef = doc(db, "users", userUid, "posts", postId);

  // Mark as approved in the user's collection
  await updateDoc(postRef, { approved: true });

  // Save the approved post without the id field
  await addDoc(collection(db, "posts"), {
    ...restPostData,
    approved: true,
  });

  // Save the approved post to the admin's approvedPosts collection without the id field
  await addDoc(collection(db, "admins", adminUid, "approvedPosts"), {
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

  // Save the rejected post to the admin's rejectedPosts collection without the id field
  await addDoc(
    collection(db, "admins", adminUid, "rejectedPosts"),
    restPostData
  );
};
