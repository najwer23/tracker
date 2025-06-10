import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View, Button, Alert } from "react-native";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { WebView } from "react-native-webview";
import { initialMapHtml } from "./leaflet";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LOCATION_TASK_NAME = "background-location-task";

interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
}

interface LocationTaskData {
  locations: Location.LocationObject[];
}

// Background location task definition
TaskManager.defineTask(
  LOCATION_TASK_NAME,
  async ({
    data,
    error,
  }: TaskManager.TaskManagerTaskBody<LocationTaskData>) => {
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

function getDistanceFromLatLonInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export default function Index() {
  const [totalDistance, setTotalDistance] = useState(0);
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [locationsList, setLocationsList] = useState<LocationCoords[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const webviewRef = useRef<WebView>(null);
  const foregroundSubscription = useRef<Location.LocationSubscription | null>(
    null
  );

  useEffect(() => {
    const loadLocation = async () => {
      try {
        const storedLocation = await AsyncStorage.getItem("latestLocation");
        if (storedLocation) {
          setLocation(JSON.parse(storedLocation));
        }
      } catch (error) {
        console.error("Failed to load location:", error);
      }
    };

    loadLocation();
  }, []);

  useEffect(() => {
    return () => {
      if (foregroundSubscription.current) {
        foregroundSubscription.current.remove();
        foregroundSubscription.current = null;
      }
      Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    };
  }, []);

  const onForegroundLocationUpdate = async (loc: Location.LocationObject) => {
    console.log("Mariusz", loc.coords.accuracy);

    setLocation(loc.coords);
    try {
      await AsyncStorage.setItem("latestLocation", JSON.stringify(loc.coords));
    } catch (e) {
      console.error("Failed to save location to AsyncStorage:", e);
    }
    setLocationsList((prev) => {
      const newList = [loc.coords, ...prev];

      // Calculate distance from previous point if exists
      if (prev.length > 0) {
        const prevPoint = prev[0];
        const dist = getDistanceFromLatLonInMeters(
          prevPoint.latitude,
          prevPoint.longitude,
          loc.coords.latitude,
          loc.coords.longitude
        );
        setTotalDistance((prevDist) => prevDist + dist);
      }

      if (webviewRef.current) {
        webviewRef.current.postMessage(
          JSON.stringify({
            type: "addMarker",
            payload: {
              ...loc.coords,
              index: newList.length - 1,
              accuracy: loc.coords.accuracy ?? 0,
            },
          })
        );
      }
      return newList;
    });
  };

  const startLocationTracking = async (): Promise<void> => {
    const { status: foregroundStatus } =
      await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== "granted") {
      Alert.alert(
        "Permission required",
        "Foreground location permission is required."
      );
      return;
    }

    const { status: backgroundStatus } =
      await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== "granted") {
      Alert.alert(
        "Permission required",
        "Background location permission is required."
      );
      return;
    }

    foregroundSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Highest,
        timeInterval: 0,
        distanceInterval: 10,
      },
      onForegroundLocationUpdate
    );

    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Highest,
      activityType: Location.ActivityType.Fitness,
      timeInterval: 0,
      distanceInterval: 10,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: "Location Tracking",
        notificationBody: "Your location is being tracked in the background",
        notificationColor: "#0000FF",
      },
      pausesUpdatesAutomatically: false,
    });

    setIsTracking(true);
  };

  const stopLocationTracking = async (): Promise<void> => {
    setIsTracking(false);
    if (foregroundSubscription.current) {
      foregroundSubscription.current.remove();
      foregroundSubscription.current = null;
    }
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
  };

  const removeAllPoints = () => {
    setTotalDistance(0);

    if (webviewRef.current) {
      webviewRef.current.postMessage(
        JSON.stringify({
          type: "clearMarkers",
        })
      );
    }
  };

  console.log(isTracking);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Background Location Tracking</Text>
      <Text>Latitude: {location ? location.latitude.toFixed(6) : "N/A"}</Text>
      <Text>Longitude: {location ? location.longitude.toFixed(6) : "N/A"}</Text>
      <Text>Total distance: {(totalDistance / 1000).toFixed(2)} km</Text>
      {!isTracking ? (
        <Button title="Start Tracking" onPress={startLocationTracking} />
      ) : (
        <Button title="Stop Tracking" onPress={stopLocationTracking} />
      )}

      <Button title="Clear All Points" onPress={removeAllPoints} />

      <Text style={styles.listTitle}>Locations history on map:</Text>

      <View style={styles.mapContainer}>
        <WebView
          ref={webviewRef}
          originWhitelist={["*"]}
          source={{ html: initialMapHtml }}
          style={styles.webview}
          scrollEnabled={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  listTitle: { marginTop: 20, fontWeight: "bold", fontSize: 16 },
  mapContainer: {
    flex: 1,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
