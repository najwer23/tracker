import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer>
        <Drawer.Screen
          name="index" // This is the name of the page and must match the url from root
          options={{
            drawerLabel: "Home",
            title: "Home",
            drawerIcon: ({ color, size }) => (
              <FontAwesome name="home" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="blt" // This is the name of the page and must match the url from root
          options={{
            drawerLabel: "Tracking without Map",
            title: "Tracking without Map",
            drawerIcon: ({ color, size }) => (
              <FontAwesome name="map-pin" size={size} color={color} />
            ),
          }}
        />
         <Drawer.Screen
          name="(blt-map)" // This is the name of the page and must match the url from root
          options={{
            drawerLabel: "Tracking with Map",
            title: "Tracking with Map",
            drawerIcon: ({ color, size }) => (
              <FontAwesome name="map" size={size} color={color} />
            ),
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
