import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { NativeEventEmitter, NativeModules } from "react-native";
import { WebView } from "react-native-webview";
import { initialMapHtml } from "./leaflet";

const LOCATION_TASK_NAME = "background-location-task";

const locationEventEmitter = new NativeEventEmitter(NativeModules.ToastExample || {});

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
  async ({ data, error }: TaskManager.TaskManagerTaskBody<LocationTaskData>) => {
    if (error) {
      console.error("Background location task error:", error);
      return;
    }
    if (data?.locations && data.locations.length > 0) {
      const location = data.locations[0];
      locationEventEmitter.emit("locationUpdate", location.coords);
    }
  }
);


export default function Index() {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [locationsList, setLocationsList] = useState<LocationCoords[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const webviewRef = useRef<WebView>(null);
  const foregroundSubscription = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    const subscription = locationEventEmitter.addListener(
      "locationUpdate",
      (coords: LocationCoords) => {
        setLocation(coords);
        setLocationsList((prev) => {
          const newList = [coords, ...prev];
          if (webviewRef.current) {
            webviewRef.current.postMessage(
              JSON.stringify({
                type: "addMarker",
                payload: { ...coords, index: newList.length - 1, accuracy: coords.accuracy ?? 0 },
              })
            );
          }
          return newList;
        });
      }
    );
    return () => subscription.remove();
  }, []);

  const onForegroundLocationUpdate = (loc: Location.LocationObject) => {
    setLocation(loc.coords);
    setLocationsList((prev) => {
      const newList = [loc.coords, ...prev];
      if (webviewRef.current) {
        console.log(loc.coords.accuracy)
        webviewRef.current.postMessage(
          JSON.stringify({
            type: "addMarker",
            payload: { ...loc.coords, index: newList.length - 1, accuracy: loc.coords.accuracy ?? 0 },
          })
        );
      }
      return newList;
    });
  };

  const startLocationTracking = async (): Promise<void> => {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== "granted") {
      Alert.alert("Permission required", "Foreground location permission is required.");
      return;
    }

    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== "granted") {
      Alert.alert("Permission required", "Background location permission is required.");
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
    if (foregroundSubscription.current) {
      foregroundSubscription.current.remove();
      foregroundSubscription.current = null;
    }
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    setIsTracking(false);
    setLocation(null);
    setLocationsList([]);
    if (webviewRef.current) {
      webviewRef.current.postMessage(
        JSON.stringify({
          type: "clearMarkers",
        })
      );
    }
  };

  useEffect(() => {
    return () => {
      if (foregroundSubscription.current) {
        foregroundSubscription.current.remove();
        foregroundSubscription.current = null;
      }
      Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    };
  }, []);

  const clearAllPoints = () => {
  setLocationsList([]); // Clear the list of locations
  setLocation(null); // Optionally clear current location

  if (webviewRef.current) {
    webviewRef.current.postMessage(
      JSON.stringify({
        type: "clearMarkers", // This message type should be handled in your WebView HTML/JS to clear markers
      })
    );
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Background Location Tracking</Text>
      <Text>Latitude: {location ? location.latitude.toFixed(6) : "N/A"}</Text>
      <Text>Longitude: {location ? location.longitude.toFixed(6) : "N/A"}</Text>
      {!isTracking ? (
        <Button title="Start Tracking" onPress={startLocationTracking} />
      ) : (
        <Button title="Stop Tracking" onPress={stopLocationTracking} />
      )}

      <Button title="Clear All Points" onPress={clearAllPoints} />


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

      <Text style={styles.note}>
        Note: Background location requires proper permissions and standalone build.
      </Text>
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
  note: { marginTop: 20, fontSize: 12, color: "gray", textAlign: "center" },
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
})
