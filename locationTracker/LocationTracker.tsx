import React, { useEffect, useState, useRef } from "react";
import { Text, View, Alert, Pressable } from "react-native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WebView, WebViewMessageEvent } from "react-native-webview";

import { style } from "./LocationTracker.style";
import {
  formatDuration,
  getDistanceFromLatLonInMeters,
} from "./LocationTracker.utils";
import { LOCATION_TASK_NAME } from "./LocationTracker.const";
import { initialMapHtml } from "@/leaflet/leaflet.const";
import "./LocationTracker.task";
import { FontAwesome } from "@expo/vector-icons";
import { useLocationTracker } from "./LocationTracker.context";
import { SimpleKalmanFilter } from "./LocationTracker.kalman";

// --- Kalman filter import

export default function LocationTracker() {
  const {
    duration,
    totalDistance,
    setLocationsList,
    setDuration,
    setTotalDistance,
  } = useLocationTracker();

  const [isTracking, setIsTracking] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [accumulatedDuration, setAccumulatedDuration] = useState(0);
  const webviewRef = useRef<WebView>(null);
  const foregroundSubscription = useRef<Location.LocationSubscription | null>(
    null
  );
  const messageQueue = useRef<string[]>([]);
  const isTrackingRef = useRef(isTracking);

  // --- Kalman filter refs
  const latFilter = useRef(new SimpleKalmanFilter());
  const lonFilter = useRef(new SimpleKalmanFilter());

  useEffect(() => {
    isTrackingRef.current = isTracking;
  }, [isTracking]);

  useEffect(() => {
    let timer: number | null = null;

    if (isTracking && startTime !== null) {
      timer = setInterval(() => {
        setDuration(Date.now() - startTime + accumulatedDuration);
      }, 1000);
    } else {
      setDuration(accumulatedDuration);
      if (timer) clearInterval(timer);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTracking, startTime, accumulatedDuration]);

  useEffect(() => {
    return () => {
      if (foregroundSubscription.current) {
        foregroundSubscription.current.remove();
        foregroundSubscription.current = null;
      }
      Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    };
  }, []);

  useEffect(() => {
    if (mapReady && webviewRef.current) {
      messageQueue.current.forEach((msg) => {
        webviewRef.current?.postMessage(msg);
      });
      messageQueue.current = [];
    }
  }, [mapReady]);

  const sendMessageToWebView = (message: object) => {
    const jsonMessage = JSON.stringify(message);
    if (webviewRef.current && mapReady) {
      webviewRef.current.postMessage(jsonMessage);
    } else {
      messageQueue.current.push(jsonMessage);
    }
  };

  const onWebViewMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "mapReady") {
        setMapReady(true);
        console.log("Map is ready to receive messages");
      }
    } catch (e) {
      console.error("Failed to parse message from WebView", e);
    }
  };

  // --- Kalman filter applied here!
  const onForegroundLocationUpdate = async (loc: Location.LocationObject) => {
    if (!isTrackingRef.current) return;

    const filteredLat = latFilter.current.filter(loc.coords.latitude);
    const filteredLon = lonFilter.current.filter(loc.coords.longitude);

    const filteredCoords = {
      ...loc.coords,
      latitude: filteredLat,
      longitude: filteredLon,
    };

    try {
      await AsyncStorage.setItem("latestLocation", JSON.stringify(filteredCoords));
    } catch (e) {
      console.error("Failed to save location to AsyncStorage:", e);
    }

    setLocationsList((prev) => {
      const newList = [filteredCoords, ...prev];

      if (prev.length > 0) {
        const prevPoint = prev[0];
        const dist = getDistanceFromLatLonInMeters(
          prevPoint.latitude,
          prevPoint.longitude,
          filteredCoords.latitude,
          filteredCoords.longitude
        );
        setTotalDistance((prevDist) => prevDist + dist);
      }

      sendMessageToWebView({
        type: "addMarker",
        payload: {
          ...filteredCoords,
          index: newList.length - 1,
          accuracy: filteredCoords.accuracy ?? 0,
        },
      });

      return newList;
    });
  };

  const startLocationTracking = async (): Promise<void> => {
    setIsTracking(true);
    setStartTime(Date.now());

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

    try {
      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      if (mapReady) {
        onForegroundLocationUpdate(initialLocation);
      }
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
  };

  const stopLocationTracking = async (): Promise<void> => {
    setIsTracking(false);
    const now = Date.now();

    if (startTime) {
      setAccumulatedDuration((prev) => prev + (now - startTime));
    }
    setStartTime(null);

    if (foregroundSubscription.current) {
      foregroundSubscription.current.remove();
      foregroundSubscription.current = null;
    }

    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
  };

  const removeAllPoints = () => {
    setTotalDistance(0);
    setLocationsList([]);
    setStartTime(null);
    setDuration(0);
    setAccumulatedDuration(0);
    setIsTracking(false);

    sendMessageToWebView({
      type: "clearMarkers",
    });
  };

  return (
    <View style={style.container}>
      <View style={style.containerStats}>
        <View style={style.columnLeft}>
          <Text style={style.distanceText}>
            {(totalDistance / 1000).toFixed(2)} km
          </Text>
          {startTime !== null || accumulatedDuration > 0 ? (
            <Text style={{ fontSize: 16, color: "#888", marginBottom: 4 }}>
              {isTracking
                ? `Duration: ${formatDuration(duration)}`
                : `Session time: ${formatDuration(duration)}`}
            </Text>
          ) : null}
        </View>

        <View
          style={[
            style.columnRight,
            { flexDirection: "row", justifyContent: "space-between" },
          ]}
        >
          <View style={style.buttonWrapper}>
            <View style={[style.buttonWrapper]}>
              <Pressable
                onPress={removeAllPoints}
                android_ripple={{ color: "rgba(0, 0, 0, 0.12)" }}
                style={() => [style.button, style.buttonWrapperBin]}
              >
                <FontAwesome name="trash" size={24} color="#fff" />
              </Pressable>
            </View>
          </View>
          {!isTracking ? (
            <View style={style.buttonWrapper}>
              <Pressable
                onPress={startLocationTracking}
                android_ripple={{ color: "rgba(0, 0, 0, 0.12)" }}
                style={() => [style.button, style.buttonWrapperPlay]}
              >
                <FontAwesome name="play" size={24} color="#fff" />
              </Pressable>
            </View>
          ) : (
            <View style={style.buttonWrapper}>
              <Pressable
                onPress={stopLocationTracking}
                android_ripple={{ color: "rgba(0, 0, 0, 0.12)" }}
                style={() => [style.button, style.buttonWrapperPause]}
              >
                <FontAwesome name="pause" size={24} color="#fff" />
              </Pressable>
            </View>
          )}
        </View>
      </View>

      <View style={style.mapContainer}>
        <WebView
          ref={webviewRef}
          originWhitelist={["*"]}
          source={{ html: initialMapHtml }}
          style={style.webview}
          scrollEnabled={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onMessage={onWebViewMessage}
          mixedContentMode="always"
          allowFileAccess={true}
        />
      </View>
    </View>
  );
}
