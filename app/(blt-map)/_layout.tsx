import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Index from '.';
import Form from './form';

const Tab = createMaterialTopTabNavigator();

export default function TabLayout() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={Index} />
      <Tab.Screen name="Form" component={Form} />
    </Tab.Navigator>
  );
}
