// viewmodels/signupViewModel.js
import { useState } from 'react';
import { signUp } from '../Model/signupModel';
import { saveUserData } from '../Model/usersModel';

export const useSignupViewModel = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    try {
      const { user } = await signUp(email, password);
      await saveUserData(user.uid, { name, email, location });
      console.log('User account created & additional data stored!');
      
    } catch (error) {
      console.error('Error signing up:', error);
    }
  };

  return {
    name,
    setName,
    email,
    setEmail,
    location,
    setLocation,
    password,
    setPassword,
    handleSignUp,
  };
};