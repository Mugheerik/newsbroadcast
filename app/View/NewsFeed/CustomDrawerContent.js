import React from "react";
import { getAuth } from "firebase/auth";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import { useDrawerViewModel } from "../../ModelView/DrawerViewModel"; // Import your ViewModel
import { useRouter } from "expo-router";
import { Image } from "react-native";
// Dummy user data for dynamic header (replace with real user data as needed)

export default function CustomDrawerContent() {
  const { userdata, handleLogout } = useDrawerViewModel();
  const userData = userdata;
  // Use the ViewModel

  const router = useRouter();

  return (
    <View style={styles.drawerContainer}>
      {/* Dynamic User Info Section */}
      <View style={styles.userInfoContainer}>
        <View style={styles.avatarContainer}>
        <Image source={{ uri: userData.profileImage }} style={styles.profileImage} />
        </View>
        <Text style={styles.userName}>{userData.name}</Text>
        <Text style={styles.userEmail}>{userData.email}</Text>
        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => router.push("/View/NewsFeed/UserProfile")}
        >
          <Text>View Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Drawer Items */}
      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => router.push("/View/NewsFeed/HomeScreen/Home")}
      >
        <Text>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.drawerItem} onPress={handleLogout}>
        <Text>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  userInfoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatarContainer: {
    backgroundColor: "#34D399", // Example color
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  userEmail: {
    fontSize: 14,
    color: "gray",
  },
  drawerItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
});
