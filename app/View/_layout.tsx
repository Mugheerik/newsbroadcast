import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack>
     <Stack.Screen
        name="Home"
        
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        
        options={{
          headerTitle: " ", // Hides the header title
        }}
      />
      <Stack.Screen
        name="Signup"
      
        options={{
          headerTitle: " ", // Hides the header title
        }}
      />
  </Stack>;
}
