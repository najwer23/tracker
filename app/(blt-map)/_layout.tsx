import React, { Suspense, lazy } from "react";
import { Text } from "react-native";

import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Form from "./form";
import { Spinner } from "@/spinner/Spinner";

const Tab = createMaterialTopTabNavigator();

const Index = lazy(() => import("."));

export default function TabLayout() {
  return (
    <Suspense fallback={<Spinner />}>
      <Tab.Navigator
        screenOptions={{
          lazy: true,
          swipeEnabled: false
        }}
      >
        <Tab.Screen name="Home" component={Index} />
        <Tab.Screen name="Form" component={Form} />
      </Tab.Navigator>
    </Suspense>
  );
}
