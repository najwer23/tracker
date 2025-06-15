import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { FontAwesome } from "@expo/vector-icons";
import { LocationTrackerProvider } from "@/locationTracker/LocationTracker.context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SessionStorage from "react-native-session-storage";
import { useEffect, useState } from "react";
import { usePathname } from "expo-router";

const queryClient = new QueryClient();

export default function Layout() {
  const path = usePathname();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    async function fetchToken() {
      const storedToken = await SessionStorage.getItem("tokenJWTaccess");
      if (typeof storedToken == "string") {
        setToken(storedToken);
      } else {
        setToken(null);
      }
    }
    fetchToken();
  }, [path]);

  const isAuthenticated = !!token;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <LocationTrackerProvider>
          <Drawer>
            <Drawer.Screen
              name="index"
              options={{
                drawerLabel: "Home",
                title: "Home",
                drawerIcon: ({ color, size }) => (
                  <FontAwesome name="home" size={size} color={color} />
                ),
              }}
            />
            <Drawer.Screen
              name="map-tracker/form/blt"
              options={{
                drawerItemStyle: { display: "none" },
                drawerLabel: "Map tracker",
                title: "Map tracker",
                drawerIcon: ({ color, size }) => (
                  <FontAwesome name="map" size={size} color={color} />
                ),
              }}
            />
            <Drawer.Screen
              name="map-tracker/form/save"
              options={{
                drawerItemStyle: { display: "none" },
                drawerLabel: "Map tracker Save",
                title: "Map tracker",
                drawerIcon: ({ color, size }) => (
                  <FontAwesome name="dashboard" size={size} color={color} />
                ),
              }}
            />
            <Drawer.Screen
              name="map-tracker/form/form"
              options={{
                drawerLabel: "Map tracker",
                title: "Map tracker",
                drawerIcon: ({ color, size }) => (
                  <FontAwesome name="map" size={size} color={color} />
                ),
              }}
            />
            <Drawer.Screen
              name="auth/login"
              options={{
                //  drawerItemStyle: { display: 'none' },
                drawerLabel: "Login",
                title: "Login",
                drawerItemStyle: { display: isAuthenticated ? "none" : "flex" },
                drawerIcon: ({ color, size }) => (
                  <FontAwesome name="lock" size={size} color={color} />
                ),
              }}
            />
            <Drawer.Screen
              name="auth/logout"
              options={{
                drawerLabel: "Logout",
                title: "Logout",
                drawerItemStyle: {
                  display: !isAuthenticated ? "none" : "flex",
                },
                drawerIcon: ({ color, size }) => (
                  <FontAwesome name="sign-out" size={size} color={color} />
                ),
              }}
            />
          </Drawer>
        </LocationTrackerProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
