import { useLocationTracker } from "@/locationTracker/LocationTracker.context";
import { FormTabParamList } from "@/navigation/Navigation.types";
import { NavigationProp } from "@react-navigation/native";
import { useNavigation, usePathname, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Text, View, ActivityIndicator, Button } from "react-native";
import SessionStorage from "react-native-session-storage";

export default function Save() {
  const router = useRouter();
  const path = usePathname();
  const navigation = useNavigation<NavigationProp<FormTabParamList>>();

  useEffect(() => {
    checkAuth();

    async function checkAuth() {
      const token = await SessionStorage.getItem("tokenJWTaccess");
      if (!token && path == "/map-tracker/form/form/Save") {
        router.push({
          pathname: "/auth/login",
          params: { from: "/map-tracker/form/form/Save", initialTab: "Save" },
        });
        navigation.navigate("Blt");
      }
    }
  }, [path, router]);

  const {
    duration,
    totalDistance,
    setLocationsList,
    setDuration,
    setTotalDistance,
  } = useLocationTracker();

  return (
    <View>
      <Text>{duration}</Text>
      <Button title="Go to Home" onPress={() => router.push("/")} />
    </View>
  );
}
