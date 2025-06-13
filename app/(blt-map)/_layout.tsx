import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Form from "./form";
import Index from ".";

const Tab = createMaterialTopTabNavigator();

export default function TabLayout() {
  return (
    <Tab.Navigator
      screenOptions={{
        lazy: true,
        swipeEnabled: false,
      }}
    >
      <Tab.Screen name="Home" component={Index} />
      <Tab.Screen name="Form" component={Form} />
    </Tab.Navigator>
  );
}
