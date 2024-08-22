// DrawerViewModel.js
import { auth } from ' ../../../firebaseConfig'; // Import your Firebase config
import { router } from 'expo-router';
import { SignOut } from '../Model/signinModel'

export const useDrawerViewModel = () => {
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await SignOut(auth);
      router.replace('/View/index')
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const updateUserProfile = async (displayName, photoURL) => {
    try {
      if (user) {
        await user.updateProfile({ displayName, photoURL });
      }
    } catch (error) {
      console.error("Error updating profile: ", error);
    }
  };

  return {
    user,
    handleLogout,
    updateUserProfile,
  };
};
