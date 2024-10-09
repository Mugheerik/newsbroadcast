import React from "react";

import { Image, TouchableOpacity, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
// Import the custom drawer content
// app/_layout.js
import { Drawer } from "expo-router/drawer";
import CustomDrawerContent from "../AdminFeed/CustomDrawerContent";

export default function Layout() {
  return (
    <Drawer drawerContent={() => <CustomDrawerContent />}>
      {/* Define routes here using Drawer.Screen */}
      <Drawer.Screen
        name="HomeScreen"
        options={{
          headerTitle: () => (
            <View style={{ width: 150, height: 20, alignItems: "center" }}>
              <Image
                source={require("../../../assets/images/neww.png")} // Replace with your logo image path
                style={{ width: 140, height: 20, marginLeft: 60 }} // Adjust width and height as needed
              />
            </View>
          ),

          headerRight: () => (
            <TouchableOpacity onPress={() => alert("Notification pressed")}>
              <Text style={{ paddingRight: 15 }}>
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color="black"
                />
              </Text>
            </TouchableOpacity>
          ),
        }}
      />

      <Drawer.Screen name="UserProfile" options={{ title: "Edit Profile" }} />
      
    </Drawer>
  );
}

// <Drawer>
//   <Drawer.Screen
//     name="HomeScreen"
//     options={{
//       headerTitle: () => (
//         <View style={{ width: 150, height: 20, alignItems: "center" }}>
//           <Image
//             source={require("../../../assets/images/neww.png")} // Replace with your logo image path
//             style={{ width: 140, height: 20, marginLeft: 60 }} // Adjust width and height as needed
//           />
//         </View>
//       ),

//       headerRight: () => (
//         <TouchableOpacity onPress={() => alert("Notification pressed")}>
//           <Text style={{ paddingRight:15 }}>
//             <Ionicons
//               name="notifications-outline"
//               size={24}
//               color="black"
//             />
//           </Text>
//         </TouchableOpacity>
//       ),
//     }}
//   />
//   <Drawer.Screen name="UserProfile" options={{ title: "Edit Profile" }} />
// </Drawer>
