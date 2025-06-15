import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Blt from "./blt";
import Save from "./save";

const Tab = createMaterialTopTabNavigator();

export default function FormTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        lazy: true,
        swipeEnabled: false,
      }}
    >
      <Tab.Screen name="Map" component={Blt} />
      <Tab.Screen name="Save" component={Save} />
    </Tab.Navigator>
  );
}
