import * as TaskManager from "expo-task-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LOCATION_TASK_NAME } from "./locationConstants";
import { LocationTaskData } from "./locationTypes";

TaskManager.defineTask(
  LOCATION_TASK_NAME,
  async ({ data, error }: TaskManager.TaskManagerTaskBody<LocationTaskData>) => {
    if (error) {
      console.error("Background location task error:", error);
      return;
    }
    if (data?.locations && data.locations.length > 0) {
      const location = data.locations[0];
      const locationData = JSON.stringify(location.coords);
      try {
        await AsyncStorage.setItem("latestLocation", locationData);
        console.log("Location saved to AsyncStorage");
      } catch (e) {
        console.error("Failed to save location to AsyncStorage:", e);
      }
    }
  }
);