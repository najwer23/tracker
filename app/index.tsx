import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MapView, { Marker, Polyline } from "react-native-maps";

const LOCATION_TASK_NAME = "background-location-task";
const STORAGE_KEY = "BACKGROUND_LOCATIONS";

interface LocationPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface LocationTaskData {
  locations: Location.LocationObject[];
}

// Background task to receive location updates
TaskManager.defineTask(
  LOCATION_TASK_NAME,
  async ({ data, error }: { data?: LocationTaskData; error?: any }) => {
    if (error) {
      console.error("Background location task error:", error);
      return;
    }
    if (data?.locations) {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const savedLocations: LocationPoint[] = stored
          ? JSON.parse(stored)
          : [];
        const newLocations = data.locations.map((loc) => ({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          timestamp: loc.timestamp,
        }));
        const updatedLocations = [...savedLocations, ...newLocations];
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(updatedLocations)
        );
        console.log("Saved locations:", updatedLocations.length);
      } catch (e) {
        console.error("Failed to save locations", e);
      }
    }
  }
);

export default function LocationTracker() {
  const [locations, setLocations] = useState<LocationPoint[]>([]);
  const [trackingMode, setTrackingMode] = useState<
    "none" | "foreground" | "background"
  >("none");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const foregroundSubscription = useRef<Location.LocationSubscription | null>(
    null
  );
  const [polylineKey, setPolylineKey] = useState(0);

  // Load saved locations from AsyncStorage
  const loadLocations = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) setLocations(JSON.parse(stored));
    } catch (e) {
      console.error("Error loading locations", e);
    }
  };

  // Clear saved locations
  const clearLocations = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setLocations([]);
      console.log("Locations cleared");
    } catch (e) {
      console.error("Failed to clear locations", e);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  // Update polyline key to force re-render on locations change
  useEffect(() => {
    setPolylineKey((k) => k + 1);
  }, [locations]);

  // Start foreground tracking (with improved error handling)
  const startForegroundTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Foreground location permission denied");
        Alert.alert(
          "Permission denied",
          "Please allow location access for the app to function properly."
        );
        return;
      }
      foregroundSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
        },
        (location) => {
          if (!location?.coords) return;
          const newLoc: LocationPoint = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: location.timestamp,
          };
          setLocations((current) => [...current, newLoc]);
        }
      );
      setTrackingMode("foreground");
      setErrorMsg(null);
    } catch (e: any) {
      setErrorMsg("Failed to start foreground tracking: " + e.message);
      Alert.alert("Error", "Failed to start foreground tracking.");
      console.error(e);
    }
  };

  // Stop foreground tracking
  const stopForegroundTracking = async () => {
    if (foregroundSubscription.current) {
      foregroundSubscription.current.remove();
      foregroundSubscription.current = null;
    }
    setTrackingMode("none");
  };

  // Start background tracking
  const startBackgroundTracking = async () => {
    try {
      const { status: fgStatus } =
        await Location.requestForegroundPermissionsAsync();
      if (fgStatus !== "granted") {
        setErrorMsg("Foreground location permission denied");
        Alert.alert(
          "Permission denied",
          "Please allow location access for the app to function properly."
        );
        return;
      }
      if (Platform.OS === "android") {
        const { status: bgStatus } =
          await Location.requestBackgroundPermissionsAsync();
        if (bgStatus !== "granted") {
          setErrorMsg("Background location permission denied");
          Alert.alert(
            "Permission denied",
            "Please allow background location access for the app."
          );
          return;
        }
      }
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(
        LOCATION_TASK_NAME
      );
      if (!hasStarted) {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.Low,
          distanceInterval: 0,
          deferredUpdatesInterval: 10,
          showsBackgroundLocationIndicator: true,
          foregroundService: {
            notificationTitle: "Background Location Tracking",
            notificationBody: "Your location is being tracked in the background",
            notificationColor: "#FF0000",
          },
        });
      }
      setTrackingMode("background");
      setErrorMsg(null);
    } catch (e: any) {
      setErrorMsg("Failed to start background tracking: " + e.message);
      Alert.alert("Error", "Failed to start background tracking.");
      console.error(e);
    }
  };

  // Stop background tracking
  const stopBackgroundTracking = async () => {
    try {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(
        LOCATION_TASK_NAME
      );
      if (hasStarted) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }
      setTrackingMode("none");
    } catch (e: any) {
      setErrorMsg("Failed to stop background tracking: " + e.message);
      console.error(e);
    }
  };

  // Unified start tracking
  const startTracking = async (mode: "foreground" | "background") => {
    setErrorMsg(null);
    if (mode === "foreground") {
      await startForegroundTracking();
    } else if (mode === "background") {
      await startBackgroundTracking();
    }
  };

  // Unified stop tracking
  const stopTracking = async () => {
    if (trackingMode === "foreground") {
      await stopForegroundTracking();
    } else if (trackingMode === "background") {
      await stopBackgroundTracking();
    }
    setTrackingMode("none");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Location Tracking Mode</Text>

      {trackingMode === "none" && (
        <View>
          <Button
            title="Start Foreground Tracking"
            onPress={() => startTracking("foreground")}
          />
          <View style={{ height: 10 }} />
          <Button
            title="Start Background Tracking"
            onPress={() => startTracking("background")}
          />
        </View>
      )}

      {trackingMode !== "none" && (
        <Button title="Stop Tracking" onPress={stopTracking} color="red" />
      )}

      <View style={styles.buttonRow}>
        <Button title="Clear Locations" onPress={clearLocations} color="red" />
        <Button title="Refresh Locations" onPress={loadLocations} />
      </View>

      {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

      {locations.length === 0 ? (
        <Text>No location points recorded yet.</Text>
      ) : (
        <>
          {/* <MapView
            showsBuildings={false}
            showsIndoorLevelPicker={false}
            style={styles.map}
            initialRegion={{
              latitude: locations[0]?.latitude || 0,
              longitude: locations[0]?.longitude || 0,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            {locations.map(
              (loc, i) =>
                (i === 0 || i === locations.length - 1) && (
                  <Marker
                    key={i.toString()}
                    coordinate={{
                      latitude: loc.latitude,
                      longitude: loc.longitude,
                    }}
                    title={`Point ${i + 1}`}
                    description={new Date(loc.timestamp).toLocaleString()}
                  />
                )
            )}

            {locations.length > 0 && (
              <Polyline
                key={polylineKey}
                coordinates={locations.map((loc) => ({
                  latitude: loc.latitude,
                  longitude: loc.longitude,
                }))}
                strokeColor="#FF0000"
                strokeWidth={3}
              />
            )}
          </MapView> */}

          <FlatList
            style={styles.list}
            data={locations}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => (
              <Text style={styles.listItem}>
                {index + 1}. Lat: {item.latitude.toFixed(6)}, Lon:{" "}
                {item.longitude.toFixed(6)}
                {"\n"}
                Time: {new Date(item.timestamp).toLocaleString()}
              </Text>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 50 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  error: { color: "red", textAlign: "center", marginBottom: 10 },
  map: { width: "100%", height: 250, marginBottom: 16 },
  list: { flex: 1 },
  listItem: { marginBottom: 10, fontSize: 14 },
});
