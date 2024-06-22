// PostViewModel.js
import { useState } from 'react';
import { createPost } from '../Model/userPost.js';

export default function usePostViewModel() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [mediaType, setMediaType] = useState('');

  const handleCreatePost = async () => {
    if (title && description && file && mediaType) {
      await createPost( title, description, file, mediaType);
     ()=> setTitle('');
     ()=> setDescription('');
     ()=>  setFile(null);
     ()=> setMediaType('');
    } else {
      console.log('All fields are required');
    }
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    file,
    setFile,
    mediaType,
    setMediaType,
    handleCreatePost
  };
}
