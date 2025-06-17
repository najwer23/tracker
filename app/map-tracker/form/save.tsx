import React, { useContext, useCallback, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { JwtContext } from "@/api/auth/jwt.context";
import { useLocationTracker } from "@/locationTracker/LocationTracker.context";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { mapTrackerSave } from "@/api/mapTracker/save.query";
import { Spinner } from "@/spinner/Spinner";

export default function Save() {
  const { isAuthenticated, tokenLoading, refreshToken } =
    useContext(JwtContext);
  const [show, setShow] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  const { locationsList, duration, totalDistance } = useLocationTracker();

  const { mutate, data, isPending, reset } = useMutation({
    mutationKey: ["mapTrackerSave", "mapTrackerSave"],
    mutationFn: mapTrackerSave,
    retry: 0,
    gcTime: 0,
  });

  const handleSave = () => {
    console.log("clikc!");
    mutate({
      duration,
      totalDistance,
      locationsList,
    });
  };

  useFocusEffect(
    useCallback(() => {
      let timer;

      setShow(false);
      setReady(false);
      reset();

      refreshToken();

      timer = setTimeout(() => {
        if (!isAuthenticated && !tokenLoading) {
          setShow(true);
        }
        setReady(true);
      }, 50);

      return () => {
        clearTimeout(timer);
      };
    }, [isAuthenticated, tokenLoading, refreshToken])
  );

  if (tokenLoading || !ready) {
    return null;
  }

  if (!isAuthenticated && show) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Please log in to access Save feature.
        </Text>
        <Button
          title="Go to Login"
          onPress={() => {
            setShow(false);
            router.push({
              pathname: "/auth/login",
              params: { redirectTo: "map-tracker" },
            });
          }}
        />
      </View>
    );
  }

  if (isPending) {
    return <Spinner />;
  }

  if (data?.code == "OK") {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Session saved!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.message}>Duration session: {duration} ms</Text>
      <View style={{ width: "100%", height: 50 }}>
        <Button title="Save" onPress={handleSave} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  message: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
});
