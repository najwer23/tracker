
import LocationTracker from "@/location/LocationTracker";

import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context"; // Optional but recommended for safe area handling

export default function Index() {
  return (
    <SafeAreaProvider>
      <LocationTracker />
    </SafeAreaProvider>
  );
}