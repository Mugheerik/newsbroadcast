import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";

export default function SecondLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer  />
    </GestureHandlerRootView>
  );
}
