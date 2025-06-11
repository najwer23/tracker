// src/components/LocationTracker.tsx
import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View, Button, Alert } from "react-native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WebView } from "react-native-webview";

import { initialMapHtml } from "@/leaflet/leaflet.const";
import { LocationCoords } from "./locationTypes";
import { styles } from "./locationTrackerStyles";
import { getDistanceFromLatLonInMeters } from "./locationUtils";
import { LOCATION_TASK_NAME } from "./locationConstants";

export default function LocationTracker() {
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
    setLocation(loc.coords);
    try {
      await AsyncStorage.setItem("latestLocation", JSON.stringify(loc.coords));
    } catch (e) {
      console.error("Failed to save location to AsyncStorage:", e);
    }

    setLocationsList((prev) => {
      const newList = [loc.coords, ...prev];

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

    // Get initial location immediately
    try {
      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      console.log(initialLocation )
      onForegroundLocationUpdate(initialLocation);
    } catch (error) {
      console.error("Failed to get initial location:", error);
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
