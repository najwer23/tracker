// Layout.tsx

import React, { useContext } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { FontAwesome } from "@expo/vector-icons";
import { LocationTrackerProvider } from "@/locationTracker/LocationTracker.context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { JwtContext, JwtProvider } from "@/api/jwt.context";

const queryClient = new QueryClient();

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <LocationTrackerProvider>
          <JwtProvider>
            <DrawerWithJwt />
          </JwtProvider>
        </LocationTrackerProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

function DrawerWithJwt() {
  const { isAuthenticated } = useContext(JwtContext);

  return (
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
          drawerLabel: "BLT with Map",
          title: "BLT with Map",
          drawerIcon: ({ color, size }) => (
            <FontAwesome name="map" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="auth/login"
        options={{
          drawerLabel: "Login",
          title: "Login",
          drawerItemStyle: { display: isAuthenticated ? "none" : "flex" },
          drawerIcon: ({ color, size }) => (
            <FontAwesome name="sign-in" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="auth/logout"
        options={{
          drawerLabel: "Logout",
          title: "Logout",
          drawerItemStyle: { display: !isAuthenticated ? "none" : "flex" },
          drawerIcon: ({ color, size }) => (
            <FontAwesome name="sign-out" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}
