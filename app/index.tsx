import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Button, NativeEventEmitter, NativeModules } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

const LOCATION_TASK_NAME = 'background-location-task';

// Use React Native's NativeEventEmitter instead of Node.js events
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

// Define the background task globally (outside component)
TaskManager.defineTask(
  LOCATION_TASK_NAME,
  async ({ data, error }: TaskManager.TaskManagerTaskBody<LocationTaskData>) => {
    if (error) {
      console.error('Background location task error:', error);
      return;
    }
    if (data?.locations && data.locations.length > 0) {
      const location = data.locations[0];
      console.log('Background location:', location.coords);
      // Emit location update event to React component
      locationEventEmitter.emit('locationUpdate', location.coords);
    }
  }
);

export default function App() {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const foregroundSubscription = useRef<Location.LocationSubscription | null>(null);

  // Subscribe to background location updates via event emitter
  useEffect(() => {
    const subscription = locationEventEmitter.addListener('locationUpdate', (coords: LocationCoords) => {
      setLocation(coords);
    });
    return () => subscription.remove();
  }, []);

  // Request permissions and start location tracking
  const startLocationTracking = async (): Promise<void> => {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      alert('Foreground location permission is required.');
      return;
    }

    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      alert('Background location permission is required.');
      return;
    }

    // Start foreground subscription to get immediate updates while app is open
    foregroundSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 10000, // every 10 seconds
        distanceInterval: 10, // every 10 meters
      },
      (loc: Location.LocationObject) => {
        setLocation(loc.coords);
        console.log('Foreground location:', loc.coords);
      }
    );

    // Start background location updates
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 60000, // 1 minute (adjust as needed)
      distanceInterval: 50, // 50 meters
      showsBackgroundLocationIndicator: true, // iOS only
      foregroundService: {
        notificationTitle: 'Location Tracking',
        notificationBody: 'Your location is being tracked in the background',
        notificationColor: '#0000FF',
      },
      pausesUpdatesAutomatically: false,
    });

    setIsTracking(true);
  };

  // Stop location tracking
  const stopLocationTracking = async (): Promise<void> => {
    if (foregroundSubscription.current) {
      foregroundSubscription.current.remove();
      foregroundSubscription.current = null;
    }
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    setIsTracking(false);
    setLocation(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (foregroundSubscription.current) {
        foregroundSubscription.current.remove();
        foregroundSubscription.current = null;
      }
      Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Background Location Tracking</Text>
      <Text>Latitude: {location ? location.latitude.toFixed(6) : 'N/A'}</Text>
      <Text>Longitude: {location ? location.longitude.toFixed(6) : 'N/A'}</Text>
      {!isTracking ? (
        <Button title="Start Tracking" onPress={startLocationTracking} />
      ) : (
        <Button title="Stop Tracking" onPress={stopLocationTracking} />
      )}
      <Text style={styles.note}>
        Note: Background location requires proper permissions and standalone build.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  note: { marginTop: 20, fontSize: 12, color: 'gray', textAlign: 'center' },
});
