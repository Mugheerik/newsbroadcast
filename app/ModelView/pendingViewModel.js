// PostViewModel.js
import { useState, useEffect } from "react";
import {
  fetchUnapprovedPosts,
  approvePost,
  rejectPost,
} from "../Model/postModel.js";
import { getAuth } from "firebase/auth";

export const usePostsViewModel = () => {
  const [posts, setPosts] = useState([]);
  const adminUid = getAuth().currentUser?.uid; // Get the admin's UID

  useEffect(() => {
    const fetchPosts = async () => {
      const unapprovedPosts = await fetchUnapprovedPosts();
      setPosts(unapprovedPosts);
    };
    fetchPosts();
  }, []);

  const approve = async (postId, postData) => {
    await approvePost(adminUid, postId, postData);
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
  };

  const reject = async (postId, postData) => {
    await rejectPost(adminUid, postId, postData);
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
  };

  return {
    posts,
    approve,
    reject,
  };
};
