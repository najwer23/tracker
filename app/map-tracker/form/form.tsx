import React, { useEffect, useRef } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Save from "./save";
import Blt from "./blt";
import { useLocalSearchParams } from "expo-router";
import { FormTabParamList } from "@/navigation/Navigation.types";

const Tab = createMaterialTopTabNavigator<FormTabParamList>();

export default function Form() {
  const { initialTab } = useLocalSearchParams<{ initialTab?: string }>();

  return (
    <Tab.Navigator
      screenOptions={{
        lazy: true,
        swipeEnabled: false,
        animationEnabled: initialTab != "Save",
      }}
    >
      <Tab.Screen key={"blt"} name="Blt" component={Blt} />
      <Tab.Screen key={"save"} name="Save" component={Save} />
    </Tab.Navigator>
  );
}
